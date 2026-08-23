import fs from 'node:fs';
import { chromium, request } from 'playwright';

const email = process.env.SMARTA_CAPTURE_EMAIL;
const password = process.env.SMARTA_CAPTURE_PASSWORD;
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const hourMs = 3_600_000;
const dayMs = 24 * hourMs;
const telemetryLimit = 5_000;
const parsedRank = Number.parseInt(process.env.SMARTA_CAPTURE_CANDIDATE_RANK || '1', 10);
const requestedRank = Number.isFinite(parsedRank) ? Math.max(1, parsedRank) : 1;
const outputPath = process.env.SMARTA_CAPTURE_OUTPUT || '/tmp/smarta-web-graph-anonymised.png';

if (!email || !password) {
  throw new Error('SMARTA_CAPTURE_EMAIL and SMARTA_CAPTURE_PASSWORD are required.');
}

const finite = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const quantile = (values, position) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * position;
  const lower = Math.floor(index);
  const fraction = index - lower;
  return sorted[lower + 1] === undefined
    ? sorted[lower]
    : sorted[lower] + fraction * (sorted[lower + 1] - sorted[lower]);
};

const median = (values) => quantile(values, 0.5);

const hasCapability = (site, capability) => {
  if (site?.productType === 'waterQuality') return false;
  if (site?.loggerVersion !== 'V3') return true;
  return Boolean(site?.siteV3?.capabilities?.[capability]);
};

const latestTelemetryTime = (site) => (
  site?.siteV3?.latestTelemetryTime
  || site?.siteV1?.latestTelemetryTime
  || null
);

const bucketRows = (rows, sinceMs) => {
  const buckets = new Map();
  const bucketSize = 15 * 60_000;
  const fields = ['level', 'current', 'power', 'flow', 'pressure', 'voltage'];

  for (const row of rows) {
    const time = new Date(row?.timeDate).getTime();
    if (!Number.isFinite(time) || time < sinceMs) continue;
    const telemetry = row?.telemV1 || {};
    const sample = {
      level: finite(telemetry.an1),
      current: finite(telemetry.I),
      power: finite(telemetry.P),
      flow: finite(telemetry.an4),
      pressure: finite(telemetry.an2),
      voltage: finite(telemetry.V),
    };
    const bucket = Math.floor(time / bucketSize) * bucketSize;
    if (!buckets.has(bucket)) {
      buckets.set(bucket, Object.fromEntries(fields.map((field) => [field, []])));
    }
    const target = buckets.get(bucket);
    for (const field of fields) {
      if (sample[field] !== null) target[field].push(sample[field]);
    }
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([time, values]) => ({
      time,
      ...Object.fromEntries(fields.map((field) => [field, median(values[field])])),
    }));
};

const smoothedValues = (samples, key) => samples
  .map((sample) => sample[key])
  .map((value, index, values) => {
    if (value === null) return null;
    return median(values
      .slice(Math.max(0, index - 1), Math.min(values.length, index + 2))
      .filter((candidate) => candidate !== null));
  })
  .filter((value) => value !== null);

const countDirectionChanges = (values, threshold) => {
  if (values.length < 3 || threshold <= 0) return 0;
  let anchor = values[0];
  let direction = 0;
  let changes = 0;

  for (const value of values.slice(1)) {
    const delta = value - anchor;
    if (Math.abs(delta) < threshold) continue;
    const nextDirection = Math.sign(delta);
    if (direction && nextDirection !== direction) changes += 1;
    direction = nextDirection;
    anchor = value;
  }
  return changes;
};

const countStateChanges = (values, threshold) => {
  const states = values.map((value) => value > threshold);
  let changes = 0;
  for (let index = 1; index < states.length; index += 1) {
    if (states[index] !== states[index - 1]) changes += 1;
  }
  return changes;
};

const analyseWindow = (rows, days) => {
  const samples = bucketRows(rows, Date.now() - days * dayMs);
  // A simultaneous voltage/level collapse is normally a reset or interrupted
  // reading, not a water-system cycle. Exclude it from ranking (the published
  // graph itself remains an untouched rendering of the real selected range).
  const levelSamples = samples.filter((sample) => (
    sample.level !== null && (sample.voltage === null || sample.voltage > 150)
  ));
  const levels = smoothedValues(levelSamples, 'level');
  if (levels.length < 24) return null;

  const level05 = quantile(levels, 0.05);
  const level95 = quantile(levels, 0.95);
  const levelSpan = Math.max(0, level95 - level05);
  const visualDenominator = Math.max(Math.abs(level95), Math.abs(level05), 1);
  const visualSpanPercent = (levelSpan / visualDenominator) * 100;
  const directionThreshold = Math.max(0.025, levelSpan * 0.08);
  const directionChanges = countDirectionChanges(levels, directionThreshold);
  const rawTravel = levels.slice(1).reduce(
    (total, value, index) => total + Math.abs(value - levels[index]),
    0,
  );
  const travelPercent = (rawTravel / visualDenominator) * 100;

  const currents = smoothedValues(samples, 'current');
  const powers = smoothedValues(samples, 'power');
  const flows = smoothedValues(samples, 'flow');
  const electrical = currents.length >= powers.length ? currents : powers;
  const electricalThreshold = currents.length >= powers.length ? 0.35 : 0.15;
  const pumpTransitions = countStateChanges(electrical, electricalThreshold);
  const activeFraction = electrical.length
    ? electrical.filter((value) => value > electricalThreshold).length / electrical.length
    : 0;
  const flow95 = flows.length ? quantile(flows, 0.95) : 0;
  const flow05 = flows.length ? quantile(flows, 0.05) : 0;
  const flowSpan = Math.max(0, flow95 - flow05);

  const firstTime = samples[0]?.time || 0;
  const lastTime = samples.at(-1)?.time || 0;
  const coverageHours = (lastTime - firstTime) / hourMs;
  const latestAgeHours = (Date.now() - lastTime) / hourMs;
  const robustMovement = Math.min(visualSpanPercent, 65) * 4
    + Math.min(travelPercent, 220) * 0.55
    + Math.min(directionChanges, 18) * 9;
  const operatingMovement = Math.min(pumpTransitions, 24) * 7
    + (activeFraction > 0.02 && activeFraction < 0.98 ? 35 : 0)
    + Math.min(flowSpan, 100) * 0.3;
  const coverage = Math.min(coverageHours / (days * 24), 1) * 55;
  const freshness = latestAgeHours < 6 ? 45 : latestAgeHours < 24 ? 25 : 0;
  const score = robustMovement + operatingMovement + coverage + freshness;

  return {
    days,
    points: samples.length,
    coverageHours,
    latestAgeHours,
    levelSpan,
    visualSpanPercent,
    directionChanges,
    travelPercent,
    pumpTransitions,
    activeFraction,
    flowSpan,
    score,
  };
};

const scrubObject = (value, siteAlias) => {
  if (Array.isArray(value)) return value.map((child) => scrubObject(child, siteAlias));
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(Object.entries(value).map(([key, child]) => {
    if (key === 'siteName') return [key, siteAlias];
    if (['company', 'customerName', 'organisation', 'organization'].includes(key)) {
      return [key, 'Smarta Demo'];
    }
    return [key, scrubObject(child, siteAlias)];
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
    `${apiOrigin}/site/all/admin?limit=2000&skip=0&sortBy=siteName:asc`,
  );
  if (!siteResponse.ok()) {
    siteResponse = await api.get(
      `${apiOrigin}/site/all?limit=2000&skip=0&sortBy=siteName:asc`,
    );
  }
  if (!siteResponse.ok()) throw new Error(`Could not load sites (${siteResponse.status()}).`);

  const sitePayload = await siteResponse.json();
  const sites = Array.isArray(sitePayload)
    ? sitePayload
    : sitePayload.sites || sitePayload.data || [];
  const candidates = sites.filter((site) => {
    const siteType = String(site?.siteType || 'well').toLowerCase();
    const latest = new Date(latestTelemetryTime(site)).getTime();
    return site?.active !== false
      && ['well', 'reservoir'].includes(siteType)
      && hasCapability(site, 'analogLevel')
      && Number.isFinite(latest)
      && Date.now() - latest < 3 * dayMs;
  });
  if (!candidates.length) throw new Error('No recent water-level sites were available.');

  const since = new Date(Date.now() - 7 * dayMs).toISOString();
  const until = new Date().toISOString();
  const scored = [];

  const scanCandidate = async (site) => {
    try {
      const url = new URL(`${apiOrigin}/telemetry/alarms/triggers/${site._id}`);
      url.searchParams.set('skip', '0');
      url.searchParams.set('limit', String(telemetryLimit));
      url.searchParams.set('sortBy', 'timeDate:desc');
      url.searchParams.set('gteDate', since);
      url.searchParams.set('lteDate', until);
      const response = await api.get(url.toString());
      if (!response.ok()) return;
      const rows = await response.json();
      if (!Array.isArray(rows)) return;

      const twoDay = analyseWindow(rows, 2);
      const sevenDay = analyseWindow(rows, 7);
      if (!twoDay && !sevenDay) return;

      const windows = [twoDay, sevenDay].filter(Boolean);
      const bestWindow = windows.reduce((best, current) => (
        current.score > best.score ? current : best
      ));
      const reservoirBonus = String(site?.siteType).toLowerCase() === 'reservoir' ? 15 : 0;
      scored.push({
        site,
        rows,
        twoDay,
        sevenDay,
        bestWindow,
        score: bestWindow.score + reservoirBonus,
      });
    } catch {
      // A single inaccessible or malformed site should not stop the candidate scan.
    }
  };

  // Keep the scan bounded so it is faster than a serial pass without placing
  // a burst of hundreds of historical queries on the production service.
  const queue = [...candidates];
  const workers = Array.from({ length: Math.min(4, queue.length) }, async () => {
    while (queue.length) {
      const site = queue.shift();
      await scanCandidate(site);
    }
  });
  await Promise.all(workers);

  scored.sort((a, b) => b.score - a.score);
  const selected = scored[requestedRank - 1];
  if (!selected) throw new Error(`Candidate rank ${requestedRank} was not available.`);
  const siteType = String(selected.site?.siteType || 'well').toLowerCase();
  const siteAlias = siteType === 'reservoir' ? 'North Reservoir' : 'North Borehole';
  const selectedRange = selected.bestWindow.days === 7 ? '7D' : '2D';

  if (process.env.SMARTA_CAPTURE_PRIVATE_OUTPUT) {
    fs.writeFileSync(
      process.env.SMARTA_CAPTURE_PRIVATE_OUTPUT,
      JSON.stringify({
        id: String(selected.site._id),
        siteName: selected.site.siteName,
        siteType,
        range: selectedRange,
      }),
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
      return route.fulfill({ response, json: scrubObject(data, siteAlias) });
    } catch {
      return route.fulfill({ response });
    }
  });

  await page.addInitScript(({ privateSiteNames, privateUserNames, publicSiteAlias }) => {
    const replacements = [
      ...privateSiteNames.map((name) => [name, publicSiteAlias]),
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
  }, {
    privateSiteNames: siteNames,
    privateUserNames: userNames,
    publicSiteAlias: siteAlias,
  });

  const telemetryRequestSiteIds = new Set();
  page.on('request', (requestData) => {
    const match = requestData.url().match(/\/telemetry\/alarms\/triggers\/([^?]+)/);
    if (match) telemetryRequestSiteIds.add(match[1]);
  });

  // Adding a query value forces a new document load. A hash-only navigation
  // would retain the site that Vuex loaded immediately after login.
  await page.goto(`https://www.smartaonline.app/?capture=${Date.now()}#/chart/telemetrychart`, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  await page.waitForTimeout(12_000);

  if (selectedRange === '7D') {
    const telemetryResponse = page.waitForResponse(
      (response) => response.url().includes('/telemetry/alarms/triggers/')
        && response.request().method() === 'GET',
      { timeout: 30_000 },
    );
    await page.getByRole('button', { name: '7D', exact: true }).click();
    await telemetryResponse;
    await page.waitForTimeout(5_000);
  }

  await page.evaluate(({ privateSiteNames, privateUserNames, publicSiteAlias }) => {
    const replacements = [
      ...privateSiteNames.map((name) => [name, publicSiteAlias]),
      ...privateUserNames.map((name) => [name, 'Smarta Demo']),
    ];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      let text = walker.currentNode.nodeValue || '';
      for (const [from, to] of replacements) text = text.split(from).join(to);
      walker.currentNode.nodeValue = text;
    }
  }, {
    privateSiteNames: siteNames,
    privateUserNames: userNames,
    publicSiteAlias: siteAlias,
  });
  await page.waitForTimeout(500);

  const bodyText = await page.locator('body').innerText();
  if ([...siteNames, ...userNames].some((name) => bodyText.includes(name))) {
    throw new Error('A private label remained in the rendered page.');
  }
  if ((await page.locator('canvas').count()) === 0) {
    throw new Error('The telemetry graph did not render.');
  }
  if (!telemetryRequestSiteIds.has(String(selected.site._id))) {
    throw new Error('The rendered graph did not use the selected anonymised candidate.');
  }

  await page.screenshot({
    path: outputPath,
    fullPage: false,
  });

  const captureData = {
    siteName: siteAlias,
    siteType,
    range: selectedRange,
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
    recentWaterLevelSitesReviewed: candidates.length,
    candidatesWithUsableGraphs: scored.length,
    selectedRank: requestedRank,
    selectedSiteType: siteType,
    selectedRange,
    selectedMovement: {
      levelSpanMetres: Number(selected.bestWindow.levelSpan.toFixed(2)),
      visualSpanPercent: Number(selected.bestWindow.visualSpanPercent.toFixed(1)),
      directionChanges: selected.bestWindow.directionChanges,
      pumpTransitions: selected.bestWindow.pumpTransitions,
      points: selected.bestWindow.points,
    },
    topCandidates: scored.slice(0, 5).map((candidate, index) => ({
      rank: index + 1,
      siteType: String(candidate.site?.siteType || 'well').toLowerCase(),
      range: candidate.bestWindow.days === 7 ? '7D' : '2D',
      levelSpanMetres: Number(candidate.bestWindow.levelSpan.toFixed(2)),
      visualSpanPercent: Number(candidate.bestWindow.visualSpanPercent.toFixed(1)),
      directionChanges: candidate.bestWindow.directionChanges,
      pumpTransitions: candidate.bestWindow.pumpTransitions,
      points: candidate.bestWindow.points,
    })),
    graphRendered: true,
    privateLabelsRemaining: false,
  }));

  await api.dispose();
  await context.close();
} finally {
  await browser.close();
}
