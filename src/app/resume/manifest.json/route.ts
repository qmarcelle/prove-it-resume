import { ALL_RESUME_LENSES } from '@/content/lenses';
import { resumeDownloadName, resumePdfPath, resumePrintRoute } from '@/lib/resume';

/**
 * The set of résumé variants to generate, published by the app itself.
 *
 * The PDF build reads this from the running server rather than importing the content
 * modules directly. That keeps one source of truth: register a lens of either kind and
 * its PDF is generated without touching the script, and avoids a build script that has
 * to replicate the app's path aliases to walk the same content graph.
 *
 * `ALL_RESUME_LENSES` rather than the role registry, so an application lens is a
 * first-class variant here. The script still knows nothing about any individual lens:
 * it reads slugs, routes and paths, and every one of them is derived.
 *
 * Static: it is derived entirely from committed content.
 */
export const dynamic = 'force-static';

export function GET() {
  const variants = ALL_RESUME_LENSES.map((lens) => ({
    slug: lens.slug,
    roleTitle: lens.roleTitle,
    route: resumePrintRoute(lens),
    pdfPath: resumePdfPath(lens),
    downloadName: resumeDownloadName(lens),
  }));

  return Response.json({ variants });
}
