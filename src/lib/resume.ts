import { defaultRole } from '@/content/roles';
import type { AnyLens, SurfaceLens } from './types';

/**
 * Résumé asset naming and projection, in one place.
 *
 * The build script, the content record, and the download buttons all derive their paths
 * from these functions rather than repeating a string. A PDF whose filename is written
 * out three times is a PDF that 404s the first time one of them changes.
 *
 * Everything here takes a `SurfaceLens`, so an application lens with its own route gets
 * its own artifact by the same rule that gives a role lens one. Nothing about naming
 * knows which kind it was handed, which is what keeps `/linear`'s download from needing
 * a special case in the component that renders it.
 */

/** Base name, without the lens suffix or extension. */
const BASE = 'qwynn-marcelle-resume';

/**
 * The masthead's target title.
 *
 * The design export renders `targetTitle` in the mono face at 11px with wide tracking,
 * so it is uppercased here rather than in CSS: `text-transform` would leave the
 * accessible name lowercase for a screen reader reading the PDF, and this string is a
 * job title, which is genuinely upper-case in this document's voice.
 *
 * The lens titles use a middot separator ("Staff / Principal · AI Platform & Developer
 * Systems"); the export used a plain run. The middot is kept — it is the site's own
 * typographic convention and reads correctly at this size.
 */
export function resumeTargetTitle(lens: SurfaceLens = defaultRole): string {
  return (lens.resumeTitle ?? lens.roleTitle).toUpperCase();
}

/** Public path of the generated PDF for a lens. */
export function resumePdfPath(lens: SurfaceLens = defaultRole): string {
  return lens.slug === defaultRole.slug ? `/${BASE}.pdf` : `/${BASE}-${lens.slug}.pdf`;
}

/** Route that renders the printable document for a lens. */
export function resumePrintRoute(lens: SurfaceLens = defaultRole): string {
  return lens.slug === defaultRole.slug ? '/resume/print' : `/resume/print/${lens.slug}`;
}

/**
 * Filename a browser should save the download as.
 *
 * An application lens is named by its organisation rather than by its role title — a
 * file called `Qwynn Marcelle - Resume (Linear).pdf` is what the person on the other
 * end is looking for in their downloads folder, and it is shorter and less ambiguous
 * than the title would be. Role lenses keep the title, because there is no organisation
 * to name.
 */
export function resumeDownloadName(lens: AnyLens = defaultRole): string {
  if (lens.slug === defaultRole.slug) return 'Qwynn Marcelle - Resume.pdf';

  const qualifier = lens.kind === 'application' ? lens.organisation : lens.roleTitle;

  return `Qwynn Marcelle - Resume (${qualifier}).pdf`;
}
