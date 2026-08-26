import type { AnyLens } from '@/lib/types';
import { APPLICATION_LENSES } from './applications';
import { ROLE_LENSES, defaultRole } from './roles';

/**
 * Every lens in the application, in one place.
 *
 * Two registries feed it because the two kinds route differently: role lenses live
 * under `/role/<slug>`, application lenses own their own path, but everything
 * *downstream* of routing treats them identically: the résumé manifest, the PDF build,
 * the download resolver, and the content tests all walk this list.
 *
 * That is the property worth protecting. Registering a new application lens should
 * produce its print route, its PDF, its manifest entry, and its download name with no
 * edit anywhere else: in particular none in `scripts/build-resume-pdf.mts`, which
 * knows nothing about any individual lens and reads the manifest the app publishes.
 */
export const ALL_LENSES: readonly AnyLens[] = [
  defaultRole,
  ...ROLE_LENSES,
  ...APPLICATION_LENSES,
] as const;

/** Every lens that has a generated PDF. That is all of them, including the default. */
export const ALL_RESUME_LENSES = ALL_LENSES;

/**
 * Lenses addressable at `/resume/print/<slug>`: everything but the durable default,
 * which is served at `/resume/print`.
 */
export const PRINTABLE_LENSES: readonly AnyLens[] = ALL_LENSES.filter(
  (lens) => !lens.isDefault,
);

export { APPLICATION_LENSES, ROLE_LENSES, defaultRole };
