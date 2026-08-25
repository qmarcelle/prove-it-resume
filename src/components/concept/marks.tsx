/**
 * Concept marks — crops of the hero's settled frame.
 *
 * Every shape here is lifted from `design/reference/claude/Prove It Resume - Hero Concept
 * B.dc.html`, whose "marks derived from the settled frame" panel states the rule these
 * follow: each is a crop of the final composition, drawn with the same stroke weight, the
 * same dashed-to-solid convention, and the same single accent.
 *
 * That derivation is the point, and it is why these are not icons. A reader meets this
 * geometry once, moving, at the top of the page — four nodes resolving onto one axis, the
 * middle two enclosed by a bracket — and then meets pieces of it again, still, beside the
 * claims it was describing. The vocabulary is learned before it is used.
 *
 * The division of labour with `components/icon`: a pictogram is something you can do, a
 * mark is something you should understand. Nothing may appear in both sets.
 *
 * **Node, edge, bracket.** The composition's second pass replaced an abstract field of
 * fragments with a labelled path, so these were re-cut against it: a node is a filled
 * square, a relation is a hairline edge, and an enclosure is a bracket underneath. The
 * marks are monochrome now, because the settled frame spends its single accent on the
 * decision node and none of these three is a crop of that node.
 *
 * Deliberately absent: the export's fourth mark, DECISION (a node, an accent edge, and a
 * filled accent square). Its only natural home is `EvidenceStatus`, whose three tones are
 * drawn at inline-chip scale — 4×9 and 6×6 — while these are card-scale at 64×40.
 * Re-cutting that component means drawing three new chip-scale marks in this grammar,
 * which the export does not supply and which is a design decision rather than a port. See
 * `docs/decisions/0008-vendored-icon-set.md`.
 */
import type { ReactNode } from 'react';

export type ConceptName = 'bounded-field' | 'one-edge' | 'unresolved';

export const CONCEPT_GEOMETRY: Readonly<Record<ConceptName, ReactNode>> = {
  /** Two related nodes with a bracket under them: what a claim does and does not cover. */
  'bounded-field': (
    <>
      <rect className="cmInk" height="7" width="7" x="14" y="16" />
      <rect className="cmInk" height="7" width="7" x="42" y="16" />
      <rect className="cmInk" height="1.25" width="17" x="23" y="19" />
      <rect className="cmQuiet" height="6" width="1.25" x="11" y="27" />
      <rect className="cmQuiet" height="1.25" width="40" x="11" y="32" />
      <rect className="cmQuiet" height="6" width="1.25" x="50" y="27" />
    </>
  ),
  /** One node feeding another: this came from that, and the direction is the point. */
  'one-edge': (
    <>
      <rect className="cmInk" height="7" width="7" x="8" y="16" />
      <rect className="cmInk" height="1.25" width="30" x="17" y="19" />
      <rect className="cmInk" height="7" width="7" x="49" y="16" />
    </>
  ),
  /** Two nodes, still dashed, still off the axis, never connected to anything. */
  unresolved: (
    <>
      <rect className="cmDashed" height="7" width="7" x="12" y="11" />
      <rect className="cmDashed" height="7" width="7" x="40" y="24" />
    </>
  ),
};

/** What each mark asserts, for a reader who cannot see it. */
export const CONCEPT_LABEL: Readonly<Record<ConceptName, string>> = {
  'bounded-field': 'Bounded',
  'one-edge': 'One edge',
  unresolved: 'Unresolved',
};
