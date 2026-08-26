import type { RoleEvidenceMapping } from './types';

/**
 * Moves the named problems to the front of a mapping, preserving the durable order of
 * everything else. Role lenses use this to express emphasis without duplicating rows:
 * a copied row is a row that can drift out of sync with the evidence it describes.
 *
 * Names that do not match a row are ignored, and repeats collapse, so a stale or sloppy
 * lens degrades to the durable
 * ordering rather than dropping evidence from the projection.
 *
 * This lives apart from `role-lens.ts` because it is pure and depends only on types.
 * `role-lens.ts` imports content, and content imports this; keeping them separate is
 * what stops that becoming an import cycle.
 */
export function prioritiseMapping(
  mapping: readonly RoleEvidenceMapping[],
  problems: readonly string[],
): RoleEvidenceMapping[] {
  const promoted: RoleEvidenceMapping[] = [];
  for (const problem of problems) {
    const row = mapping.find((candidate) => candidate.problem === problem);
    // Deduplicated: a lens that names the same problem twice must not render it twice.
    if (row && !promoted.includes(row)) promoted.push(row);
  }

  return [...promoted, ...mapping.filter((row) => !promoted.includes(row))];
}
