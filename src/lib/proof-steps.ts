/**
 * The six proof stages, in narrative order.
 *
 * These are the sections the rail tracks and guided mode walks.
 *
 * `n` and `id` are separate fields, and that separation is the point. `n` is the visible
 * position; `id` is the section's permanent identity and the anchor a shared link
 * carries. The export numbered both at once (`sec-01`…`sec-06`) which held here only
 * because position and identity happened to agree, and broke on `/linear`, where the
 * same ids were reordered and `#sec-02` began arriving from a section printed as `06`.
 */
export type ProofStep = {
  n: string;
  id: string;
  label: string;
};

export const PROOF_STEPS: readonly ProofStep[] = [
  { n: '01', id: 'operating-thesis', label: 'Problem' },
  { n: '02', id: 'vreko', label: 'Vreko' },
  { n: '03', id: 'repository-intelligence', label: 'Repository Intelligence' },
  { n: '04', id: 'interlock', label: 'Interlock' },
  { n: '05', id: 'role-fit', label: 'Role Fit' },
  { n: '06', id: 'career', label: 'Career' },
] as const;

/** Offset applied when scrolling to a section, matching the export's `- 92`. */
export const SCROLL_OFFSET = 92;
