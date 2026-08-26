import type { IconName } from './paths';

/**
 * What an affordance promises the reader.
 *
 * Call sites name the promise, never the picture. That indirection is the whole point:
 * "one meaning, one icon" is a rule that decays the moment two components reach for the
 * same glyph to mean two different things, and the only reliable way to keep it is to
 * make the glyph unreachable except through a meaning.
 *
 * The page this replaces had the opposite problem. A single `↓` was doing four
 * unrelated jobs: download a file, expand a disclosure, scroll to a section, and show
 * the direction of dataflow, and `↗` was doing three, standing in for an exact frozen
 * artifact, a living profile page, and a pinned citation that is deliberately not a
 * live page. A reader could not predict what an affordance would do by looking at it.
 */
export type Affordance =
  /** Opens an exact, inspectable artifact in a new tab. */
  | 'inspect-artifact'
  /**
   * Leaves for another site: a profile, an organisation, a living page.
   *
   * Deliberately distinct from `inspect-artifact`, and the distinction is the reason
   * this set exists at all. A frozen artifact is a thing a reader can check a claim
   * against; a profile page is somewhere they end up. The old `↗` meant both, which
   * is precisely the overload being removed, and giving them one shared icon would
   * rebuild it in better geometry.
   */
  | 'visit-external-site'
  /** Opens a document to read: a specification, a case study, a published docs site. */
  | 'read-document'
  /** Saves a file to disk. */
  | 'download-file'
  /** Opens a mail client. The one destination on the site that does not navigate. */
  | 'compose-mail'
  /** A frozen citation pinned behind a claim, rather than a live page. */
  | 'pinned-citation'
  /** Puts a command on the clipboard. */
  | 'copy-command'
  /** That command is now on the clipboard. */
  | 'copy-confirmed'
  /** Moves the reader down this page. */
  | 'move-down-page'
  /** Moves the reader up this page. */
  | 'move-up-page'
  /** Advances a controlled sequence by one step. */
  | 'advance-sequence'
  /** Reverses a controlled sequence by one step. */
  | 'reverse-sequence'
  /** Opens a disclosure without moving the reader. */
  | 'expand-in-place'
  /** Closes a disclosure without moving the reader. */
  | 'collapse-in-place'
  /** Leaves a mode. */
  | 'exit-mode';

/**
 * The mapping, and the only one.
 *
 * `icon-semantics.test.ts` asserts this is injective (no icon may serve two meanings)
 * so a future edit that reuses `arrow-down` for both a download and an anchor fails the
 * suite rather than passing review. That is the same enforcement posture the evidence
 * rules already use: the pinned-commit rule is a test, not a convention.
 */
export const AFFORDANCE_ICON: Readonly<Record<Affordance, IconName>> = {
  'inspect-artifact': 'external-link',
  'visit-external-site': 'arrow-up-right',
  'read-document': 'file-text',
  'download-file': 'download',
  'compose-mail': 'mail',
  'pinned-citation': 'file-lock',
  'copy-command': 'copy',
  'copy-confirmed': 'check',
  'move-down-page': 'arrow-down',
  'move-up-page': 'arrow-up',
  'advance-sequence': 'arrow-right',
  'reverse-sequence': 'arrow-left',
  'expand-in-place': 'chevron-down',
  'collapse-in-place': 'chevron-up',
  'exit-mode': 'x',
};

/**
 * Which promise a call-to-action label is making.
 *
 * The content already draws this distinction in words: a row says `READ THE SPEC` or
 * `INSPECT FROZEN RUN`, never both, so the affordance is read back out of the verb
 * rather than added to `EvidenceRef` as a field. A second field would be a second place
 * for the same fact to live, and the two would eventually disagree.
 *
 * Anything that is not asking to be read is treated as an artifact, because that is the
 * safer default here: `EvidenceLink` only renders a call to action at all once a record
 * is verified with an exact destination.
 */
export function affordanceForCta(cta: string): Affordance {
  const verb = cta.trim().toUpperCase();
  const reads = verb.startsWith('READ') || verb.startsWith('OPEN DOCS');

  return reads ? 'read-document' : 'inspect-artifact';
}
