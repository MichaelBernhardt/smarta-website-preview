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

    if (route === '/resources/') {
      await expect(page.locator('body')).not.toContainText('Archive notice');
      await expect(page.locator('body')).not.toContainText('These files were published in 2018');
    }

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
  await expect(page.locator('.mobile-header-cta')).toHaveText('Request a site assessment');
  const toggle = page.locator('[data-menu-toggle]');
  await expect(toggle).toHaveAccessibleName('Open navigation');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle).toHaveAccessibleName('Close navigation');
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await page.locator('#mobile-menu').getByRole('link', { name: 'How Smarta works' }).click();
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await expect(page).toHaveURL(/#platform$/);

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your water system');
  await expect(page.locator('body')).toContainText('Automate pump control');
  await expect(page.locator('.system-story-screen img')).toHaveCount(1);
  await expect(page.locator('.system-path')).toContainText('Pumps & sensors');
  await expect(page.locator('.system-path')).toContainText('Automatic control');
  await expect(page.locator('.outcomes-band li')).toHaveCount(5);
  await expect(page.locator('.outcomes-band')).toContainText('Automatic reservoir filling');
  await expect(page.locator('.proof-strip')).toContainText('11');
  await expect(page.locator('.proof-strip')).toContainText('years in business');
  await expect(page.locator('body')).toContainText('See what changed, and when.');
  await expect(page.locator('.online-preview-copy')).toContainText('a borehole starting and stopping');
  await expect(page.locator('body')).not.toContainText('100M');
  await expect(page.locator('.online-preview-screen figcaption')).toHaveCount(0);
  await expect(page.locator('#sectors .sector-card')).toHaveCount(4);
  await expect(page.locator('#sectors .sector-card-photo img')).toHaveCount(4);
  await expect(page.locator('#sectors .sector-panorama')).toHaveCount(0);
  await expect(page.locator('#sectors .sector-card-top > span')).toHaveCount(0);
  await expect(page.locator('.capability-card .card-number')).toHaveCount(0);
  await expect(page.locator('#sectors')).toContainText('Estates');
  await expect(page.locator('#sectors')).toContainText('Mines');
  await expect(page.locator('#sectors')).toContainText('Farms');
  await expect(page.locator('#sectors')).toContainText('Municipalities');
  await expect(page.locator('#installations .gallery-card')).toHaveCount(12);
  await expect(page.locator('#case-study')).toContainText('12 boreholes. 3 reservoirs. One water network.');
  await expect(page.locator('#case-study .case-study-stats > div')).toHaveCount(3);
  await expect(page.locator('#case-study')).toContainText('24');
  await expect(page.getByRole('link', { name: /See Smarta Estate/ })).toHaveAttribute('href', 'https://www.smartaestate.co.za/');
  await expect(page.locator('body')).not.toContainText('valve automation is not included');
  await expect(page.getByRole('link', { name: /Apple App Store/ })).toHaveAttribute('href', /apps\.apple\.com/);
  await expect(page.getByRole('link', { name: /Google Play/ })).toHaveAttribute('href', /play\.google\.com/);
  const assessmentLinks = page.getByRole('link', { name: /Request a site assessment/ });
  await expect(assessmentLinks).toHaveCount(4);
  await expect.poll(() => assessmentLinks.evaluateAll((links) => links.every((link) => link.getAttribute('href') === '#contact'))).toBe(true);
  await expect(page.locator('img[src="images/app/smarta-mobile-reservoir-anonymised.jpg"]')).toHaveCount(1);
  await expect(page.locator('footer')).not.toContainText('LLM information');
  const telemetryGraph = page.locator('.online-preview-screen img[src="images/platform/smarta-online-telemetry-anonymised.jpg"]');
  await expect(telemetryGraph).toHaveCount(1);
  await expect(telemetryGraph).toHaveAttribute('alt', /borehole showing pump cycles/i);
});

test('homepage mobile layout brings real product proof forward', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto('/');

  const heroHeight = await page.locator('.hero').evaluate((element) => element.getBoundingClientRect().height);
  expect(heroHeight).toBeLessThanOrEqual(844);

  const layout = await page.evaluate(() => {
    const style = (selector) => getComputedStyle(document.querySelector(selector));
    const columns = (selector) => style(selector).gridTemplateColumns.split(' ').filter(Boolean).length;
    const storyPicture = document.querySelector('.system-story-screen picture').getBoundingClientRect();
    const storyImage = document.querySelector('.system-story-screen img');

    return {
      storyAreas: style('.system-story-grid').gridTemplateAreas,
      appAreas: style('.app-grid').gridTemplateAreas,
      outcomeColumns: columns('.outcomes-band ul'),
      proofColumns: columns('.proof-grid'),
      storyFrameRatio: storyPicture.width / storyPicture.height,
      storyObjectFit: getComputedStyle(storyImage).objectFit,
      fieldCopyOrder: style('.field-copy').order,
      fieldPhotoOrder: style('.field-photo').order,
      openFaqItems: document.querySelectorAll('.faq-list details[open]').length,
    };
  });

  expect(layout.storyAreas).toContain('"story-heading" "story-screen" "story-details"');
  expect(layout.appAreas).toContain('"app-intro" "app-visual" "app-actions"');
  expect(layout.outcomeColumns).toBe(2);
  expect(layout.proofColumns).toBe(3);
  expect(layout.storyFrameRatio).toBeGreaterThan(1.2);
  expect(layout.storyFrameRatio).toBeLessThan(1.35);
  expect(layout.storyObjectFit).toBe('cover');
  expect(layout.fieldCopyOrder).toBe('1');
  expect(layout.fieldPhotoOrder).toBe('2');
  expect(layout.openFaqItems).toBe(0);

  await page.locator('[data-menu-toggle]').click();
  const menuSurface = await page.locator('#mobile-menu').evaluate((element) => ({
    backgroundColor: getComputedStyle(element).backgroundColor,
    height: element.getBoundingClientRect().height,
  }));
  expect(menuSurface.backgroundColor).toBe('rgb(255, 255, 255)');
  expect(menuSurface.height).toBeGreaterThan(700);
});

test('internal pages use restrained mobile editorial surfaces', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 844 });

  await page.goto('/resources/');
  const resourceStyles = await page.evaluate(() => ({
    textureDisplay: getComputedStyle(document.querySelector('.subpage-texture')).display,
    featuredRadius: getComputedStyle(document.querySelector('.resource-card-featured')).borderRadius,
    featuredShadow: getComputedStyle(document.querySelector('.resource-card-featured')).boxShadow,
  }));
  expect(resourceStyles.textureDisplay).toBe('none');
  expect(resourceStyles.featuredRadius).toBe('0px');
  expect(resourceStyles.featuredShadow).toBe('none');

  await page.goto('/privacy/');
  await expect(page.locator('.legal-summary')).toHaveCSS('border-radius', '0px');
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
