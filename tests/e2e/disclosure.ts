import type { Locator, Page } from '@playwright/test';

/**
 * Opening the application surface's curiosity paths, the way a reader does.
 *
 * `/linear` states each section's point as ordinary document content and puts the dense
 * evidence behind a named question. That is the whole intent of the surface, and it
 * makes a specific hazard for this suite: a test that only ever reads the resting page
 * would go green while a register quietly stopped rendering, because the thing it used
 * to assert is now simply not in the document until asked for.
 *
 * So the rule these helpers exist to enforce is that every assertion about deep evidence
 * says *which question it came from*. Reaching a receipt now costs the test the same
 * click it costs a reader, which is the point.
 */

/** The invitation lists, one per progressively disclosed section. */
function invitations(scope: Page | Locator): Locator {
  return scope.getByRole('list', { name: /^Questions this/ });
}

/**
 * Opens one section's curiosity path by the question it asks.
 *
 * Scoped to a section locator rather than the page, because two sections may ask
 * similar questions and a test that opened the wrong one would still pass its next
 * assertion often enough to be misleading.
 */
export async function openPath(section: Locator, invitation: RegExp): Promise<void> {
  await section.getByRole('button', { name: invitation }).click();
}

/**
 * Opens the `index`th curiosity path in every disclosed section on the page.
 *
 * For the sweeps that check a whole page at once: overflow, clipping, touch targets,
 * accessibility. Only one path per section can be open at a time, so a sweep that wants
 * to see all of the deep material runs once per index rather than opening everything at
 * once. Sections with fewer paths than `index` are skipped rather than failing, so the
 * sweep does not have to know how many questions each section asks.
 */
export async function openEveryPath(page: Page, index = 0): Promise<void> {
  const lists = invitations(page);

  for (let i = 0; i < (await lists.count()); i += 1) {
    const buttons = lists.nth(i).getByRole('button');
    if ((await buttons.count()) > index) await buttons.nth(index).click();
  }
}

/** How many curiosity paths the deepest section on the page offers. */
export async function deepestPathCount(page: Page): Promise<number> {
  const lists = invitations(page);
  let deepest = 0;

  for (let i = 0; i < (await lists.count()); i += 1) {
    deepest = Math.max(deepest, await lists.nth(i).getByRole('button').count());
  }

  return deepest;
}
