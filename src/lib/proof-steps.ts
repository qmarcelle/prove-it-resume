/**
 * The six proof stages, in narrative order.
 *
 * These are the sections the rail tracks and guided mode walks. Ids match the design
 * export (`sec-01`…`sec-06`) so anchors from the preserved mockup still resolve, and so
 * the ported IntersectionObserver observes exactly the elements it did in the original.
 */
export type ProofStep = {
  n: string;
  id: string;
  label: string;
};

export const PROOF_STEPS: readonly ProofStep[] = [
  { n: '01', id: 'sec-01', label: 'Problem' },
  { n: '02', id: 'sec-02', label: 'Vreko' },
  { n: '03', id: 'sec-03', label: 'Repository Intelligence' },
  { n: '04', id: 'sec-04', label: 'Interlock' },
  { n: '05', id: 'sec-05', label: 'Role Fit' },
  { n: '06', id: 'sec-06', label: 'Career' },
] as const;

/** Offset applied when scrolling to a section, matching the export's `- 92`. */
export const SCROLL_OFFSET = 92;
