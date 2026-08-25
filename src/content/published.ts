/**
 * The published surfaces for each system.
 *
 * One list, because two rules depend on it and they must not drift apart: evidence rows
 * point their calls to action at a published page rather than at a repository, and the
 * résumé's VERIFY links point at the same places. If a system's front door moves, it
 * moves here and both follow.
 *
 * These are the sites a reader can open and read. The exact artifact a claim was
 * written against travels separately, as the `sourceHref` pin on the evidence row.
 */
export const PUBLISHED_SITES = {
  vreko: 'https://vreko.dev/',
  vrekoDocs: 'https://docs.vreko.dev',
  workspaceJson: 'https://www.workspacejson.dev',
  interlock: 'https://interlock.marcellelabs.io/',
  personal: 'https://qwynn.marcellelabs.io/',
} as const;

/** Origins that count as "published" for the published-first linking rule. */
export const PUBLISHED_ORIGINS = [
  'https://vreko.dev/',
  'https://docs.vreko.dev/',
  'https://www.workspacejson.dev/',
  'https://interlock.marcellelabs.io/',
] as const;
