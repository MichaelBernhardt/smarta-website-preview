import { test, expect } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';

const publicPages = ['/', '/resources/', '/privacy/', '/404.html'];

for (const route of publicPages) {
  test(`${route} has no broken local assets or serious accessibility violations`, async ({ page, request }) => {
    const failedResponses = [];
    const consoleErrors = [];

    page.on('response', (response) => {
      const url = new URL(response.url());
      if (url.hostname === '127.0.0.1' && response.status() >= 400) {
        failedResponses.push(`${response.status()} ${url.pathname}`);
      }
    });
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto(route, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((element) => element.classList.add('is-visible')));
    await page.waitForTimeout(650);
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.title()).not.toBe('');

    const imageSources = await page.locator('img').evaluateAll((images) => images.map((image) => image.currentSrc || image.src));
    for (const source of imageSources) {
      const imageResponse = await request.get(source);
      expect(imageResponse.ok(), `${source} should load`).toBeTruthy();
    }
    expect(failedResponses).toEqual([]);
    expect(consoleErrors).toEqual([]);

    const accessibility = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const materialViolations = accessibility.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
    expect(materialViolations).toEqual([]);
  });
}

test('homepage mobile navigation and primary content work', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.locator('.mobile-header-cta')).toBeVisible();
  await expect(page.locator('.mobile-header-cta')).toHaveAttribute('href', '#contact');
  const toggle = page.locator('[data-menu-toggle]');
  await expect(toggle).toHaveAccessibleName('Open navigation');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle).toHaveAccessibleName('Close navigation');
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await page.locator('#mobile-menu').getByRole('link', { name: 'Platform' }).click();
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await expect(page).toHaveURL(/#platform$/);

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your water system');
  await expect(page.locator('body')).toContainText('Automate pump control');
  await expect(page.locator('.proof-strip')).toContainText('11');
  await expect(page.locator('.proof-strip')).toContainText('years in business');
  await expect(page.locator('body')).toContainText('See what changed, and when.');
  await expect(page.locator('body')).not.toContainText('100M');
  await expect(page.locator('.online-preview-screen figcaption')).toHaveCount(0);
  await expect(page.locator('#sectors .sector-card')).toHaveCount(4);
  await expect(page.locator('#sectors .sector-card-top > span')).toHaveCount(0);
  await expect(page.locator('.capability-card .card-number')).toHaveCount(0);
  await expect(page.locator('#sectors')).toContainText('Estates');
  await expect(page.locator('#sectors')).toContainText('Mines');
  await expect(page.locator('#sectors')).toContainText('Farms');
  await expect(page.locator('#sectors')).toContainText('Municipalities');
  await expect(page.locator('#installations .gallery-card')).toHaveCount(12);
  await expect(page.getByRole('link', { name: /See Smarta Estate/ })).toHaveAttribute('href', 'https://www.smartaestate.co.za/');
  await expect(page.locator('body')).not.toContainText('valve automation is not included');
  await expect(page.getByRole('link', { name: /Apple App Store/ })).toHaveAttribute('href', /apps\.apple\.com/);
  await expect(page.getByRole('link', { name: /Google Play/ })).toHaveAttribute('href', /play\.google\.com/);
  await expect(page.getByRole('link', { name: /Request a site assessment/ })).toHaveAttribute('href', '#contact');
  await expect(page.locator('img[src="images/app/smarta-mobile-reservoir-anonymised.jpg"]')).toHaveCount(1);
  await expect(page.locator('img[src="images/platform/smarta-online-telemetry-anonymised.jpg"]')).toHaveCount(1);
});

test('SEO and machine-readable endpoints are present', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://smarta.co.za/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /estates, mines, farms and municipalities/i);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);

  for (const path of ['/robots.txt', '/sitemap.xml', '/llms.txt', '/llms-full.txt', '/site.webmanifest', '/images/social/smarta-og.jpg']) {
    const response = await request.get(path);
    expect(response.ok(), `${path} should be available`).toBeTruthy();
    expect((await response.body()).length, `${path} should not be empty`).toBeGreaterThan(20);
  }
});
