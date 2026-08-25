import type { ResumeProjectionId } from '@/lib/types';
import { defaultResumeProjection } from './projections/default';
import { linearResumeProjection } from './projections/linear';
import { resolveResume, type ResumeProjection } from './projection';

/**
 * The résumé, as durable facts plus projections over them.
 *
 * `facts.ts` holds what is true. `projections/` holds what a given reader should see
 * first. Nothing imports a projection directly except this module and the tests; the
 * rest of the application asks for a projection by id, which is what a lens carries.
 */
export const RESUME_PROJECTIONS: Record<ResumeProjectionId, ResumeProjection> = {
  default: defaultResumeProjection,
  linear: linearResumeProjection,
};

export function getResumeProjection(id: ResumeProjectionId): ResumeProjection {
  return RESUME_PROJECTIONS[id];
}

/**
 * The résumé for a projection id, with every fact already looked up.
 *
 * Resolved rather than passed as a projection so the layouts stay dumb: a layout
 * arranges primitives and never reaches into the fact corpus, which is what keeps
 * "a projection selects, it does not author" true at the rendering layer too.
 */
export function resolveResumeById(id: ResumeProjectionId) {
  return resolveResume(RESUME_PROJECTIONS[id]);
}

/** Sheets in every rendered projection. Asserted by `tests/e2e/resume.spec.ts`. */
export { RESUME_IDENTITY, UNVERIFIED } from './facts';
export { resolveResume } from './projection';
export type { ResumeProjection, ResolvedResume } from './projection';
