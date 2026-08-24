import { PROOFS } from '@/content/proofs';
import { ROLE_LENSES, defaultRole } from '@/content/roles';
import type { Proof, RoleLens } from './types';

/**
 * Resolves a `/role/<slug>` segment to a lens.
 *
 * Returns `undefined` rather than falling back to the default lens: an unrecognised
 * slug should 404, not silently serve a different projection that the reader believes is
 * the one they asked for.
 */
export function getRoleLens(slug: string): RoleLens | undefined {
  return ROLE_LENSES.find((lens) => lens.slug === slug);
}

export function listRoleSlugs(): string[] {
  return ROLE_LENSES.map((lens) => lens.slug);
}

/**
 * Projects the durable proof set through a lens.
 *
 * A lens may reorder proofs and may name a subset it cares about. It may never add,
 * remove, or alter one — proofs named in `proofOrder` that do not exist are ignored, and
 * any proof the lens omits is appended in its durable position so evidence cannot be
 * quietly dropped from a projection.
 */
export function projectProofs(lens: RoleLens = defaultRole): Proof[] {
  const ordered = lens.proofOrder
    .map((id) => PROOFS.find((proof) => proof.id === id))
    .filter((proof): proof is Proof => proof !== undefined);

  const remainder = PROOFS.filter((proof) => !ordered.includes(proof));

  return [...ordered, ...remainder];
}
