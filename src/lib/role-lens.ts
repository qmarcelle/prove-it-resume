import { PROOFS } from '@/content/proofs';
import { APPLICATION_LENSES, PRINTABLE_LENSES, ROLE_LENSES } from '@/content/lenses';
import { defaultRole } from '@/content/roles';
import type { AnyLens, ApplicationLens, Proof, RoleLens, SurfaceLens } from './types';

/**
 * Resolves a `/role/<slug>` segment to a lens.
 *
 * Returns `undefined` rather than falling back to the default lens: an unrecognised
 * slug should 404, not silently serve a different projection that the reader believes is
 * the one they asked for.
 *
 * Application lenses are deliberately *not* resolvable here. `/role/linear` is not a
 * second address for `/linear`; it is a URL that does not exist, and this returning
 * `undefined` for it is what makes that true.
 */
export function getRoleLens(slug: string): RoleLens | undefined {
  return ROLE_LENSES.find((lens) => lens.slug === slug);
}

export function listRoleSlugs(): string[] {
  return ROLE_LENSES.map((lens) => lens.slug);
}

/** Resolves an application lens by its slug, e.g. `linear`. */
export function getApplicationLens(slug: string): ApplicationLens | undefined {
  return APPLICATION_LENSES.find((lens) => lens.slug === slug);
}

/**
 * Resolves any lens that has a printable résumé at `/resume/print/<slug>`.
 *
 * One resolver for both kinds, because the print route does not care which kind it was
 * handed — it renders whichever content projection the lens names. Splitting it would
 * mean a new application lens needed an edit in the print route as well as a
 * registration, which is exactly the coupling the registry exists to remove.
 */
export function getPrintableLens(slug: string): AnyLens | undefined {
  return PRINTABLE_LENSES.find((lens) => lens.slug === slug);
}

export function listPrintableSlugs(): string[] {
  return PRINTABLE_LENSES.map((lens) => lens.slug);
}

/**
 * Projects the durable proof set through a lens.
 *
 * A lens may reorder proofs and may name a subset it cares about. It may never add,
 * remove, or alter one — proofs named in `proofOrder` that do not exist are ignored, and
 * any proof the lens omits is appended in its durable position so evidence cannot be
 * quietly dropped from a projection.
 */
export function projectProofs(lens: SurfaceLens = defaultRole): Proof[] {
  const ordered = lens.proofOrder
    .map((id) => PROOFS.find((proof) => proof.id === id))
    .filter((proof): proof is Proof => proof !== undefined);

  const remainder = PROOFS.filter((proof) => !ordered.includes(proof));

  return [...ordered, ...remainder];
}
