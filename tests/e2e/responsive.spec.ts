import { expect, test } from '@playwright/test';

const VIEWPORTS = [
  { name: '320', width: 320, height: 720 },
  { name: '375', width: 375, height: 812 },
  { name: '768', width: 768, height: 1024 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1440', width: 1440, height: 900 },
];

for (const viewport of VIEWPORTS) {
  test(`no horizontal page overflow at ${viewport.name}px`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');

    // Open everything: revealed wide content is the usual source of overflow.
    await page.getByRole('button', { name: /SHOW CLAIM LEDGER/ }).click();
    await page.getByRole('button', { name: /Inspect evidence.*EV-WSJ/ }).click();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test('the proof rail stays compact on a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');

  const rail = page.getByRole('navigation', { name: 'Proof progress' });
  const box = await rail.boundingBox();

  expect(box).not.toBeNull();
  // The rail must not consume a large share of a small viewport.
  expect(box!.height).toBeLessThan(720 * 0.25);
});

test('wide tables scroll inside their own container, not the page', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');
  await page.getByRole('button', { name: /SHOW CLAIM LEDGER/ }).click();

  const scrollable = await page.locator('#ledger').evaluate((el) => {
    const wrap = el.querySelector('table')?.parentElement;
    if (!wrap) return null;
    return {
      scrolls: wrap.scrollWidth > wrap.clientWidth,
      overflowX: getComputedStyle(wrap).overflowX,
    };
  });

  expect(scrollable?.overflowX).toBe('auto');
});

test('body copy stays legible on a small screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');

  const smallest = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('p, li, span, a, h1, h2, h3, h4')];
    const sizes = nodes
      .filter((el) => (el.textContent ?? '').trim().length > 0)
      .filter((el) => {
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      })
      .map((el) => parseFloat(getComputedStyle(el).fontSize));
    return Math.min(...sizes);
  });

  // The design's microtype floor was raised so metadata reads as information.
  expect(smallest).toBeGreaterThanOrEqual(11.5);
});
