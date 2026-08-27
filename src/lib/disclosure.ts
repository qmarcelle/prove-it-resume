import type { DisclosureCopy } from './types';
/**
 * The query key each progressively disclosed section opens its deep layer with.
 *
 * ## Why a section may not choose its own
 *
 * `ProgressiveDisclosure` is one component mounted five times, so the key has to come
 * from outside it, and the tempting shortcut is one shared key holding `section:path`.
 * That is broken rather than merely inelegant: every mounted instance applies the
 * incoming URL on mount, and the four instances whose paths do not match the value
 * publish it as absent, so whichever section mounts last wins and `COPY THIS VIEW`
 * hands out a link with no disclosure in it at all.
 *
 * Separate keys also give the better shared link. A reader who opened the leadership
 * lesson *and* the coordination limits copies a view that reproduces both, rather than
 * whichever one the mount order happened to keep.
 *
 * ## Why they are named here and not in the page plan
 *
 * A key is part of the page's public address surface: once a reviewer has pasted
 * `?practice=native-delegation` into a thread it is a URL somebody may return to, and
 * renaming a section's id should not silently retire it. So the mapping is explicit,
 * and `deep-link.test.ts` holds it against the sections that actually render one.
 *
 * The values deliberately avoid `interlock`, which the counterfactual already owns.
 */
export const DISCLOSURE_KEYS = {
  'product-history': 'history',
  'linear-in-practice': 'practice',
  'never-ask-twice': 'memory',
  'repository-intelligence': 'context',
  interlock: 'coordination',
  /*
   * The closing mapping's remainder. Named here for the same reason the five chapters
   * are: once a reviewer has sent someone `/linear?mapping=complete` to make a point
   * about breadth, that address has to keep resolving.
   */
  'product-judgment': 'mapping',
} as const;

/**
 * The path copy a section is composed around, or a thrown error naming what is missing.
 *
 * Deliberately fatal, for the same reason `requireStep` is. A section composes its
 * curiosity paths by name: it knows it renders `built` and `leadership`, and the lens
 * says what those ask and what they answer. If the lens has dropped one, the forgiving
 * version renders an amber control with no words in it, or an invitation that opens an
 * empty panel, and both are worse than the section failing to build.
 *
 * Composition by name rather than by index is the point. `paths[0]` would keep
 * rendering after somebody reordered the lens copy, and would quietly put the
 * leadership lesson behind the question about what was built.
 */
export function requirePath(
  paths: readonly DisclosureCopy[],
  id: string,
): DisclosureCopy {
  const found = paths.find((entry) => entry.id === id);
  if (!found) {
    throw new Error(
      `Disclosure path "${id}" is rendered but absent from the lens copy. Add it to ` +
        "the lens's section projection, or stop rendering it: the copy is the only " +
        'place a curiosity path may be defined.',
    );
  }
  return found;
}
