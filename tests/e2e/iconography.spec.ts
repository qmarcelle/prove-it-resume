import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

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
   * still legitimate content here: `workspace.json → Codex → Tally` is a pipeline, not
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
   * this page (the guided-mode exit) carries an `aria-label`.
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

/*
 * The hero's sequence is driven by `setTimeout`, so its wall-clock length is a floor and
 * not a bound: with the suite at full parallelism these timers are starved and a ~3s
 * choreography has been observed still sitting on beat zero six seconds in. These budgets
 * are generous on purpose: a slow machine is not a regression, and Playwright resolves
 * as soon as the attribute lands, so the passing case costs nothing.
 */
const REWIND_MS = 10_000;
const SETTLE_MS = 30_000;

/** Longer than the whole sequence, for asserting that it has *not* run. */
const PAST_SEQUENCE_MS = 5_000;

const stageOf = (page: Page) => page.locator('svg[data-beat]');
const figureOf = (page: Page) => page.locator('figure:has(svg[data-beat])');

/*
 * Arrive at the figure and watch it finish.
 *
 * Two waits, and the first one is the load-bearing one. `data-beat="3"` is already true
 * at first paint: the server renders the settled frame and the sequence rewinds into it,
 * so waiting only for beat 3 passes instantly and reads the composition before it has
 * played. Beat 0 first proves the rewind happened; the scroll then satisfies the viewport
 * gate, which is a no-op on a viewport where the figure was already on screen.
 */
async function playThrough(page: Page) {
  const stage = stageOf(page);
  await expect(stage).toHaveAttribute('data-beat', '0', { timeout: REWIND_MS });
  await figureOf(page).scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute('data-beat', '3', { timeout: SETTLE_MS });

  return stage;
}

test.describe('the hero composition', () => {
  // The budgets above only bind if the per-test ceiling clears them.
  test.describe.configure({ timeout: 60_000 });

  test('settles to the same frame under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const stage = page.locator('svg[data-beat]');
    await expect(stage).toHaveAttribute('data-beat', '3');
    // The sequence never runs, so the frame is still B3 well past its duration.
    await page.waitForTimeout(PAST_SEQUENCE_MS);
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

    // Rewound to the start, then played forward without being touched.
    await playThrough(page);
  });

  /*
   * It plays on first meaningful viewport entry, not on mount. A sequence that had
   * already finished by the time the reader scrolled to it would be a load-order
   * accident, and the beats are the claim; they are worth nothing unwatched.
   */
  test('waits for the stage to be on screen before it plays', async ({ page }) => {
    // Short enough that the figure starts well below the fold in either project.
    await page.setViewportSize({
      width: page.viewportSize()?.width ?? 1280,
      height: 380,
    });
    await page.goto('/');

    const stage = stageOf(page);
    await expect(stage).toHaveAttribute('data-beat', '0', { timeout: REWIND_MS });
    await expect(figureOf(page)).not.toBeInViewport();

    // Well past the whole sequence. Nothing was scrolled to, so nothing has played.
    await page.waitForTimeout(PAST_SEQUENCE_MS);
    await expect(stage).toHaveAttribute('data-beat', '0');

    await figureOf(page).scrollIntoViewIfNeeded();
    await expect(stage).toHaveAttribute('data-beat', '3', { timeout: SETTLE_MS });
  });

  /*
   * The bracket is a claim boundary, and this page renders those rather than collapsing
   * them to make a picture tidier: `boundary` sits inside `EvidenceKind` on purpose. So
   * it survives to the settled frame with its name attached.
   */
  test('keeps the named boundary in the settled frame', async ({ page, viewport }) => {
    // Below 640px the bracket is dropped, per the export. That case is asserted below.
    test.skip((viewport?.width ?? 0) <= 640, 'the bracket is not drawn at this width');

    await page.goto('/');
    const stage = await playThrough(page);

    await expect(stage.locator('path[d^="M 250 96"]')).toHaveAttribute('opacity', '1');
    await expect(figureOf(page).getByText('BOUND', { exact: true })).toBeVisible();
  });

  /*
   * The node outside the bracket is excluded, never absorbed; it leaves outward, and it
   * is not standing in the settled frame. It is the one mark on the stage with no station
   * label, and the export's second pass exists because an anonymous dashed box left
   * beside the answer is what stopped the first frame being readable cold.
   */
  test('excludes the unnamed node rather than absorbing it', async ({ page }) => {
    await page.goto('/');
    const stage = await playThrough(page);

    const stray = stage.locator('rect[x="592"]');
    await expect(stray).toHaveAttribute('opacity', '0');
    // Outward: the stage is 640 units wide and it left to the right of everything.
    await expect(stray).toHaveAttribute('transform', 'translate(26 0)');
  });

  test('is clean to axe mid-sequence as well as at rest', async ({ page }) => {
    await page.goto('/');
    // Arrive at the figure, which is what starts the sequence at all.
    await figureOf(page).scrollIntoViewIfNeeded();
    await expect(page.locator('svg[data-beat="1"], svg[data-beat="2"]')).toBeVisible({
      timeout: SETTLE_MS,
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
