import fs from 'node:fs';
import { chromium, request } from 'playwright';

const email = process.env.SMARTA_CAPTURE_EMAIL;
const password = process.env.SMARTA_CAPTURE_PASSWORD;
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

if (!email || !password) {
  throw new Error('SMARTA_CAPTURE_EMAIL and SMARTA_CAPTURE_PASSWORD are required.');
}

const finite = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const scrubObject = (value) => {
  if (Array.isArray(value)) return value.map(scrubObject);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(Object.entries(value).map(([key, child]) => {
    if (key === 'siteName') return [key, 'North Reservoir'];
    if (['company', 'customerName', 'organisation', 'organization'].includes(key)) {
      return [key, 'Smarta Demo'];
    }
    return [key, scrubObject(child)];
  }));
};

const browser = await chromium.launch({
  executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
  headless: true,
});

try {
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  await page.goto('https://www.smartaonline.app/', {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  await page.locator('input[name="username"]').fill(email);
  await page.locator('input[name="password"]').fill(password);

  const loginResponsePromise = page.waitForResponse(
    (response) => response.url().includes('/user/login') && response.request().method() === 'POST',
    { timeout: 30_000 },
  );
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  const loginResponse = await loginResponsePromise;
  if (!loginResponse.ok()) throw new Error(`Login failed with status ${loginResponse.status()}.`);

  const loginPayload = await loginResponse.json();
  const token = loginPayload.token;
  if (!token) throw new Error('Login did not return an authentication token.');

  const apiOrigin = new URL(loginResponse.url()).origin;
  const api = await request.newContext({
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      'X-Client-Type': 'web-app',
    },
  });

  let siteResponse = await api.get(
    `${apiOrigin}/site/all/admin?limit=500&skip=0&sortBy=siteName:asc`,
  );
  if (!siteResponse.ok()) {
    siteResponse = await api.get(
      `${apiOrigin}/site/all?limit=500&skip=0&sortBy=siteName:asc`,
    );
  }
  if (!siteResponse.ok()) throw new Error(`Could not load sites (${siteResponse.status()}).`);

  const sitePayload = await siteResponse.json();
  const sites = Array.isArray(sitePayload)
    ? sitePayload
    : sitePayload.sites || sitePayload.data || [];
  const reservoirs = sites.filter(
    (site) => site?.active !== false && String(site?.siteType).toLowerCase() === 'reservoir',
  );
  if (!reservoirs.length) throw new Error('No active reservoir sites were available.');

  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const until = new Date().toISOString();
  const scored = [];

  for (const site of reservoirs.slice(0, 30)) {
    try {
      const url = new URL(`${apiOrigin}/telemetry/alarms/triggers/${site._id}`);
      url.searchParams.set('skip', '0');
      url.searchParams.set('limit', '900');
      url.searchParams.set('sortBy', 'timeDate:desc');
      url.searchParams.set('gteDate', since);
      url.searchParams.set('lteDate', until);
      const response = await api.get(url.toString());
      if (!response.ok()) continue;
      const rows = await response.json();
      if (!Array.isArray(rows)) continue;

      const values = rows
        .map((row) => finite(row?.telemV1?.an1))
        .filter((value) => value !== null);
      if (values.length < 24) continue;

      const spread = Math.max(...values) - Math.min(...values);
      const latestAgeHours = rows[0]?.timeDate
        ? (Date.now() - new Date(rows[0].timeDate).getTime()) / 3_600_000
        : 9_999;
      const hasDimensions = finite(site.reservoirHeight) > 0
        && finite(site.reservoirDiameter) > 0;
      const score = Math.min(values.length, 900)
        + Math.min(spread * 120, 220)
        + (latestAgeHours < 24 ? 150 : 0)
        + (hasDimensions ? 80 : 0);
      scored.push({ site, rows, values, score });
    } catch {
      // A single inaccessible or malformed site should not stop the candidate scan.
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const selected = scored[0];
  if (!selected) throw new Error('No reservoir had enough recent level data.');

  if (process.env.SMARTA_CAPTURE_PRIVATE_OUTPUT) {
    fs.writeFileSync(
      process.env.SMARTA_CAPTURE_PRIVATE_OUTPUT,
      JSON.stringify({ id: String(selected.site._id), siteName: selected.site.siteName }),
      { mode: 0o600 },
    );
  }

  const siteNames = sites
    .map((site) => site?.siteName)
    .filter((value) => typeof value === 'string' && value.trim().length > 1);
  const userNames = [
    loginPayload.user?.name,
    loginPayload.user?.surname,
    loginPayload.user?.company,
  ].filter((value) => typeof value === 'string' && value.trim().length > 1);
  const userInitials = [loginPayload.user?.name, loginPayload.user?.surname]
    .filter(Boolean)
    .map((value) => String(value).trim().charAt(0).toUpperCase())
    .join('');
  if (userInitials.length > 1) userNames.push(userInitials);

  const expires = Math.floor(Date.now() / 1000) + 86_400;
  await context.clearCookies({ name: 'smarta_pms_app_siteId' });
  await context.clearCookies({ name: 'smarta_pms_app_name' });
  await context.addCookies([
    {
      name: 'smarta_pms_app_siteId',
      value: String(selected.site._id),
      url: 'https://www.smartaonline.app/',
      expires,
      sameSite: 'Lax',
      secure: true,
    },
    {
      name: 'smarta_pms_app_name',
      value: 'Smarta Demo',
      url: 'https://www.smartaonline.app/',
      expires,
      sameSite: 'Lax',
      secure: true,
    },
  ]);

  await context.route('**/site/**', async (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    const response = await route.fetch();
    const contentType = response.headers()['content-type'] || '';
    if (!contentType.includes('application/json')) return route.fulfill({ response });

    try {
      const data = await response.json();
      return route.fulfill({ response, json: scrubObject(data) });
    } catch {
      return route.fulfill({ response });
    }
  });

  await page.addInitScript(({ privateSiteNames, privateUserNames }) => {
    const replacements = [
      ...privateSiteNames.map((name) => [name, 'North Reservoir']),
      ...privateUserNames.map((name) => [name, 'Smarta Demo']),
    ];
    const scrub = (root) => {
      if (!root) return;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        let text = walker.currentNode.nodeValue || '';
        for (const [from, to] of replacements) text = text.split(from).join(to);
        walker.currentNode.nodeValue = text;
      }
    };
    new MutationObserver(() => scrub(document.body)).observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    document.addEventListener('DOMContentLoaded', () => scrub(document.body));
  }, { privateSiteNames: siteNames, privateUserNames: userNames });

  await page.goto('https://www.smartaonline.app/#/chart/telemetrychart', {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  await page.waitForTimeout(12_000);

  await page.evaluate(({ privateSiteNames, privateUserNames }) => {
    const replacements = [
      ...privateSiteNames.map((name) => [name, 'North Reservoir']),
      ...privateUserNames.map((name) => [name, 'Smarta Demo']),
    ];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      let text = walker.currentNode.nodeValue || '';
      for (const [from, to] of replacements) text = text.split(from).join(to);
      walker.currentNode.nodeValue = text;
    }
  }, { privateSiteNames: siteNames, privateUserNames: userNames });
  await page.waitForTimeout(500);

  const bodyText = await page.locator('body').innerText();
  if ([...siteNames, ...userNames].some((name) => bodyText.includes(name))) {
    throw new Error('A private label remained in the rendered page.');
  }
  if ((await page.locator('canvas').count()) === 0) {
    throw new Error('The telemetry graph did not render.');
  }

  await page.screenshot({
    path: '/tmp/smarta-web-graph-anonymised.png',
    fullPage: false,
  });

  const captureData = {
    siteName: 'North Reservoir',
    siteType: 'reservoir',
    reservoirHeight: finite(selected.site.reservoirHeight),
    reservoirDiameter: finite(selected.site.reservoirDiameter),
    latest: selected.rows[0]
      ? {
          timeDate: selected.rows[0].timeDate,
          telemV1: {
            an1: finite(selected.rows[0]?.telemV1?.an1),
            an2: finite(selected.rows[0]?.telemV1?.an2),
            an4: finite(selected.rows[0]?.telemV1?.an4),
            mode: selected.rows[0]?.telemV1?.mode,
            rel1: selected.rows[0]?.telemV1?.rel1,
          },
        }
      : null,
    telemetry: selected.rows.slice(0, 900).map((row) => ({
      timeDate: row.timeDate,
      telemV1: {
        an1: finite(row?.telemV1?.an1),
        an2: finite(row?.telemV1?.an2),
        an4: finite(row?.telemV1?.an4),
      },
    })),
  };
  fs.writeFileSync(
    '/tmp/smarta-reservoir-anonymised.json',
    JSON.stringify(captureData),
    { mode: 0o600 },
  );

  console.log(JSON.stringify({
    login: 'ok',
    reservoirsReviewed: reservoirs.length,
    pointsInSelectedGraph: selected.values.length,
    graphRendered: true,
    privateLabelsRemaining: false,
  }));

  await api.dispose();
  await context.close();
} finally {
  await browser.close();
}
