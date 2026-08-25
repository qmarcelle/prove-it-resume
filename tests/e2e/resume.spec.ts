import { expect, test, type Page } from '@playwright/test';

/**
 * Résumé geometry and the download path.
 *
 * The résumé is a fixed 8.5in × 11in document with `overflow: hidden`: unlike the rest
 * of the site it cannot reflow, so anything that grows a block pushes content past the
 * bottom edge, where it is silently clipped rather than wrapped. That failure is
 * invisible in a unit test and invisible on screen until you look at the PDF, so the
 * page box and the bottom-anchored elements are asserted directly.
 *
 * This caught a real regression during the port: the site body's `line-height: 1.6`
 * cascaded into the document and pushed page two's footer off the sheet.
 */

/** 8.5in × 11in at CSS's fixed 96dpi. */
const PAGE_W = 816;
const PAGE_H = 1056;

const ROUTES = [
  { route: '/resume/print', title: 'STAFF / PRINCIPAL AI PLATFORM ENGINEER' },
  { route: '/resume/print/athenahealth-yoh', title: 'SENIOR AI PLATFORM ENGINEER' },
  { route: '/resume/print/end-to-end-delivery', title: 'END-TO-END DELIVERY ENGINEER' },
];

async function printPage(page: Page, route: string) {
  await page.emulateMedia({ media: 'print' });
  await page.goto(route);
  await page.evaluate(() => document.fonts.ready);
}

for (const { route, title } of ROUTES) {
  test(`${route} renders two letter-sized pages`, async ({ page }) => {
    await printPage(page, route);

    const pages = page.locator('[id^="resume-page-"]');
    await expect(pages).toHaveCount(2);

    for (const id of ['#resume-page-1', '#resume-page-2']) {
      const box = await page.locator(id).boundingBox();
      expect(box?.width).toBeCloseTo(PAGE_W, 0);
      expect(box?.height).toBeCloseTo(PAGE_H, 0);
    }
  });

  test(`${route} keeps its masthead title on one line, with room to spare`, async ({
    page,
  }) => {
    await printPage(page, route);

    await expect(page.getByText(title, { exact: true })).toBeVisible();

    // Two mono lines would be ~41px. A wrap here shifts the whole document down and, on
    // a fixed page box, clips the footer off the bottom of page two.
    const row = await page.locator('#resume-page-1 header > div').nth(1).boundingBox();
    expect(row?.height).toBeLessThan(32);

    /*
     * Headroom, not just line count. The title and the domains string share one fixed
     * measure, and the export's own tuning left 1.3px of slack — which fit on macOS and
     * wrapped on Linux, because font metrics differ between Chromium builds. Asserting
     * the margin is what makes this catch a too-long title here rather than on whatever
     * platform someone else runs.
     */
    const slack = await page.evaluate(() => {
      const el = document.querySelectorAll('#resume-page-1 header > div')[1];
      if (!el) return -1;
      const used = [...el.children].reduce(
        (total, child) => total + child.getBoundingClientRect().width,
        0,
      );
      const GAP = 18;
      return el.clientWidth - used - GAP;
    });

    expect(slack, 'masthead must not sit within a hair of wrapping').toBeGreaterThan(12);
  });

  /*
   * The contact row is the one masthead line the design lets wrap — it is authored with
   * `flex-wrap: wrap` and a row gap, and four links plus a location do not fit on one
   * line at this measure. So the assertion is not "never wraps" but "wraps at most
   * once": a third line costs another ~21px on a page that has ~43px of slack left, and
   * the block above the boundary note would start losing its last row. Pinning the line
   * count here means a fifth contact link fails as a test, not as a clipped PDF nobody
   * opens until it is in front of a recruiter.
   */
  test(`${route} keeps the contact row to at most two lines`, async ({ page }) => {
    await printPage(page, route);

    const row = await page.locator('#resume-page-1 header > div').nth(2).boundingBox();
    expect(row?.height, 'contact row must not reach a third line').toBeLessThan(50);
  });

  test(`${route} keeps bottom-anchored content inside the page`, async ({ page }) => {
    await printPage(page, route);

    // Both are pinned to the foot of their page with `margin-top: auto`; if anything
    // above them grows, these are the first things clipped.
    for (const [id, text] of [
      ['#resume-page-1', 'Public source and recorded evidence'],
      ['#resume-page-2', 'FULL EVIDENCE SYSTEM'],
    ]) {
      const pageBox = await page.locator(id as string).boundingBox();
      const el = await page
        .locator(id as string)
        .getByText(text as string, { exact: false })
        .first()
        .boundingBox();

      expect(el).not.toBeNull();
      const bottom = (el?.y ?? 0) + (el?.height ?? 0);
      expect(bottom).toBeLessThanOrEqual((pageBox?.y ?? 0) + PAGE_H);
    }
  });
}

test('the résumé links out to the published sites, not to bare profiles', async ({
  page,
}) => {
  await printPage(page, '/resume/print');

  const verify = page.getByRole('link', { name: 'VERIFY ↗' });
  await expect(verify).toHaveCount(3);

  expect(
    await verify.evaluateAll((links) => links.map((l) => l.getAttribute('href'))),
  ).toEqual([
    'https://vreko.dev/',
    'https://www.workspacejson.dev',
    'https://interlock.marcellelabs.io/',
  ]);
});

test('every résumé call to action downloads the lens it belongs to', async ({ page }) => {
  await page.goto('/');
  const neutral = page.locator('a[href^="/qwynn-marcelle-resume"]');
  await expect(neutral.first()).toHaveAttribute('href', '/qwynn-marcelle-resume.pdf');

  await page.goto('/role/athenahealth-yoh');
  const lensed = page.locator('a[href^="/qwynn-marcelle-resume"]');
  expect(await lensed.count()).toBeGreaterThan(0);
  for (const href of await lensed.evaluateAll((links) =>
    links.map((l) => l.getAttribute('href')),
  )) {
    expect(href).toBe('/qwynn-marcelle-resume-athenahealth-yoh.pdf');
  }
});

test('the generated PDF is served and is a real PDF', async ({ request }) => {
  const response = await request.get('/qwynn-marcelle-resume.pdf');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');

  const body = await response.body();
  expect(body.subarray(0, 5).toString('latin1')).toBe('%PDF-');
});
