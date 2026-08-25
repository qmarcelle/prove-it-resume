import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * The icon system's guarantees, checked against the built page rather than the source.
 *
 * The unit suite already proves the primitive draws a one-pixel stroke and hides itself
 * from assistive technology. What it cannot prove is that the marks stayed decorative
 * once thirty call sites got hold of them, that no affordance lost its word, and that
 * the hero's settled frame really is what a reader gets with no JavaScript.
 */

/** Glyphs that used to stand in for an action, and must no longer end one. */
const AFFORDANCE_GLYPHS = ['→', '↗', '↓', '↑', '←', '✕', '▸', '▾', '+', '−'];

test('no affordance ends in a decorative glyph', async ({ page }) => {
  await page.goto('/');

  /*
   * Scoped to the *last* character rather than to any occurrence, because arrows are
   * still legitimate content here — `workspace.json → Codex → Tally` is a pipeline, not
   * a call to action. What must be gone is the trailing glyph that used to carry the
   * promise, since an icon is `aria-hidden` and a screen-reader user would hear nothing
   * in its place.
   */
  const trailing = await page.locator('a, button').evaluateAll((els) =>
    els
      .map((el) => (el.textContent ?? '').trim())
      .filter((text) => text.length > 0)
      .map((text) => ({ text, last: text.slice(-1) })),
  );

  const offenders = trailing.filter((entry) => AFFORDANCE_GLYPHS.includes(entry.last));
  expect(offenders).toEqual([]);
});

test('every icon is decorative and reserves its own box', async ({ page }) => {
  await page.goto('/');

  const marks = await page.locator('svg[aria-hidden="true"]').evaluateAll((els) =>
    els.map((el) => ({
      width: Number(el.getAttribute('width')),
      height: Number(el.getAttribute('height')),
      viewBox: el.getAttribute('viewBox'),
      focusable: el.getAttribute('focusable'),
      stroke: el.getAttribute('stroke'),
    })),
  );

  expect(marks.length).toBeGreaterThan(10);
  for (const mark of marks) {
    // Declared on the element, so the box exists before any stylesheet resolves.
    expect(Number.isFinite(mark.width) && mark.width > 0).toBe(true);
    expect(Number.isFinite(mark.height) && mark.height > 0).toBe(true);
    expect(mark.focusable).toBe('false');

    /*
     * The box keeps its grid's ratio. Action icons are drawn on 24×24 and concept marks
     * on 64×40; either stretched would stop being the shape it was cut from.
     */
    const [, , vw, vh] = (mark.viewBox ?? '').split(/\s+/).map(Number);
    expect(mark.width / mark.height).toBeCloseTo(vw / vh, 2);
  }

  // Action icons inherit their colour, so one inside a dark panel inverts with the text.
  const strokes = marks.filter((m) => m.viewBox === '0 0 24 24').map((m) => m.stroke);
  expect(strokes.length).toBeGreaterThan(10);
  expect([...new Set(strokes)]).toEqual(['currentColor']);
});

test('every affordance still carries its word', async ({ page }) => {
  await page.goto('/');

  /*
   * "Change is never colour alone" generalises: it is never *mark* alone either. An
   * icon-only control is allowed, but it has to name itself, which is why the one on
   * this page — the guided-mode exit — carries an `aria-label`.
   */
  const unnamed = await page.locator('a, button').evaluateAll((els) =>
    els
      .filter((el) => {
        const text = (el.textContent ?? '').replace(/\s+/g, '');
        const labelled =
          el.getAttribute('aria-label') ?? el.getAttribute('aria-labelledby');
        return text.length === 0 && !labelled;
      })
      .map((el) => el.outerHTML.slice(0, 120)),
  );

  expect(unnamed).toEqual([]);
});

test.describe('the hero composition', () => {
  test('settles to the same frame under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const stage = page.locator('svg[data-beat]');
    await expect(stage).toHaveAttribute('data-beat', '3');
    // The sequence never runs, so the frame is still B3 well past its duration.
    await page.waitForTimeout(3600);
    await expect(stage).toHaveAttribute('data-beat', '3');
  });

  test('is the settled frame with no JavaScript at all', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');

    await expect(page.locator('svg[data-beat]')).toHaveAttribute('data-beat', '3');
    await expect(page.getByText('SETTLED')).toBeVisible();
    await context.close();
  });

  test('runs its beats and comes to rest', async ({ page }) => {
    await page.goto('/');

    const stage = page.locator('svg[data-beat]');
    // Rewound to the start, then played forward without being touched.
    await expect(stage).toHaveAttribute('data-beat', '0', { timeout: 2000 });
    await expect(stage).toHaveAttribute('data-beat', '3', { timeout: 6000 });
  });

  /*
   * The excluded candidate stays drawn. `boundary` is part of `EvidenceKind` on purpose,
   * and the interaction contract says claim boundaries are "rendered, never collapsed" —
   * a hero whose last beat erased what it ruled out would contradict the page under it.
   */
  test('keeps the ruled-out candidate visible outside the boundary', async ({ page }) => {
    await page.goto('/');

    /*
     * Wait for the rewind before waiting for the rest. `data-beat="3"` is already true
     * at first paint — the server renders the settled frame and the sequence rewinds
     * into it — so waiting only for beat 3 passes instantly and reads the composition
     * before it has played.
     */
    const stage = page.locator('svg[data-beat]');
    await expect(stage).toHaveAttribute('data-beat', '0', { timeout: 2000 });
    await expect(stage).toHaveAttribute('data-beat', '3', { timeout: 6000 });

    const opacity = await page
      .locator('svg[data-beat] rect[stroke-dasharray="4 4"], svg[data-beat] rect')
      .evaluateAll((els) => {
        const stray = els.find((el) => el.getAttribute('x') === '576');
        return stray ? Number(stray.getAttribute('opacity')) : null;
      });

    expect(opacity).toBeGreaterThan(0);
    expect(opacity).toBeLessThan(1);
  });

  test('is clean to axe mid-sequence as well as at rest', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('svg[data-beat="1"], svg[data-beat="2"]')).toBeVisible({
      timeout: 3000,
    });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

test('a re-check command can be copied', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');

  await page.getByRole('button', { name: /Inspect evidence.*EV-VRK/ }).click();
  const copy = page.getByRole('button', { name: /COPY the re-check command/ }).first();
  await expect(copy).toBeVisible();

  await copy.click();
  await expect(page.getByRole('button', { name: /COPIED/ }).first()).toBeVisible();
});
