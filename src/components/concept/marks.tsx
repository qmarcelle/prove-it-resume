/**
 * Concept marks — crops of the hero's settled frame.
 *
 * Every shape here is lifted from `design/reference/claude/Prove It Resume - Hero Concept
 * B.dc.html`, whose "marks derived from the settled frame" panel states the rule these
 * follow: each is a crop of the final composition, drawn with the same stroke weight, the
 * same dashed-to-solid convention, and the same single accent.
 *
 * That derivation is the point, and it is why these are not icons. A reader meets this
 * geometry once, moving, at the top of the page — fragments resolving onto an evidence
 * baseline inside a boundary — and then meets pieces of it again, still, beside the
 * claims it was describing. The vocabulary is learned before it is used.
 *
 * The division of labour with `components/icon`: a pictogram is something you can do, a
 * mark is something you should understand. Nothing may appear in both sets.
 *
 * Deliberately absent: the export's fourth mark, SHIPPED (a solid unit with an accent
 * terminus). Its only natural home is `EvidenceStatus`, whose three tones are drawn at
 * inline-chip scale — 4×9 and 6×6 — while these are card-scale at 64×40. Re-cutting that
 * component means drawing three new chip-scale marks in this grammar, which the export
 * does not supply and which is a design decision rather than a port. See
 * `docs/decisions/0008-vendored-icon-set.md`.
 */
import type { ReactNode } from 'react';

export type ConceptName = 'bounded-field' | 'on-evidence' | 'unresolved';

export const CONCEPT_GEOMETRY: Readonly<Record<ConceptName, ReactNode>> = {
  /** Two bounds enclosing a field: what a claim does and does not cover. */
  'bounded-field': (
    <>
      <rect className="cmInk" height="24" width="1.25" x="8" y="8" />
      <rect className="cmInk" height="24" width="1.25" x="54" y="8" />
      <rect className="cmOutline" height="10" width="28" x="18" y="16" />
    </>
  ),
  /** A solid unit standing on an evidence baseline. */
  'on-evidence': (
    <>
      <rect className="cmInk" height="12" width="44" x="10" y="14" />
      <rect className="cmAccent" height="1.5" width="44" x="10" y="29" />
    </>
  ),
  /** Two fragments, still dashed, never aligned to anything. */
  unresolved: (
    <>
      <rect className="cmDashed" height="9" width="20" x="10" y="10" />
      <rect className="cmDashed" height="9" width="20" x="34" y="22" />
    </>
  ),
};

/** What each mark asserts, for a reader who cannot see it. */
export const CONCEPT_LABEL: Readonly<Record<ConceptName, string>> = {
  'bounded-field': 'Bounded',
  'on-evidence': 'On evidence',
  unresolved: 'Unresolved',
};
