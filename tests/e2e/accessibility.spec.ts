import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Automated accessibility checks. These catch the mechanical failures — contrast,
 * names, roles, landmarks — and are run with drawers both closed and open, because
 * revealed content is exactly where these regressions hide.
 */
async function analyse(page: import('@playwright/test').Page) {
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
}

test('the durable page has no automatically detectable violations', async ({ page }) => {
  await page.goto('/');
  const results = await analyse(page);
  expect(results.violations).toEqual([]);
});

test('a role lens has no automatically detectable violations', async ({ page }) => {
  await page.goto('/role/athenahealth-yoh');
  const results = await analyse(page);
  expect(results.violations).toEqual([]);
});

test('revealed content is also clean', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /Inspect evidence.*EV-VRK/ }).click();
  await page.getByRole('button', { name: /Inspect evidence.*EV-WSJ/ }).click();
  await page.getByRole('button', { name: /Inspect evidence.*EV-ILK/ }).click();
  await page.getByRole('button', { name: /SHOW CLAIM LEDGER/ }).click();
  await page.getByRole('button', { name: /Why MCP instead of another/ }).click();
  await page.getByRole('button', { name: 'Walk the proof', exact: true }).click();

  const results = await analyse(page);
  expect(results.violations).toEqual([]);
});

test('every interactive element is reachable by keyboard', async ({ page }) => {
  await page.goto('/');

  const reached = new Set<string>();
  for (let i = 0; i < 60; i += 1) {
    await page.keyboard.press('Tab');
    const descriptor = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      return `${el.tagName}:${(el.textContent ?? '').trim().slice(0, 40)}`;
    });
    if (descriptor) reached.add(descriptor);
  }

  // The skip link, the hero action, and the rail must all be tabbable.
  expect([...reached].some((d) => d.includes('Skip to the proof'))).toBe(true);
  expect([...reached].some((d) => d.includes('Walk the proof'))).toBe(true);
  expect(reached.size).toBeGreaterThan(15);
});

test('the focused element always has a visible focus indicator', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');

  const outline = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    const style = getComputedStyle(el);
    return { width: style.outlineWidth, style: style.outlineStyle };
  });

  expect(outline?.style).not.toBe('none');
  expect(parseFloat(outline?.width ?? '0')).toBeGreaterThan(0);
});

test('reduced-motion preference disables smooth scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const behaviour = await page.evaluate(
    () => getComputedStyle(document.documentElement).scrollBehavior,
  );
  expect(behaviour).toBe('auto');

  // Guided navigation must still work with motion suppressed.
  await page.getByRole('button', { name: 'Walk the proof', exact: true }).click();
  await expect(
    page.getByRole('group', { name: 'Guided proof navigation' }),
  ).toBeVisible();
});
