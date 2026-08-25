import { ROLE_LENSES, defaultRole } from '@/content/roles';
import { resumeDownloadName, resumePdfPath, resumePrintRoute } from '@/lib/resume';

/**
 * The set of résumé variants to generate, published by the app itself.
 *
 * The PDF build reads this from the running server rather than importing the content
 * modules directly. That keeps one source of truth — add a role lens and its PDF is
 * generated without touching the script — and avoids a build script that has to
 * replicate the app's path aliases to walk the same content graph.
 *
 * Static: it is derived entirely from committed content.
 */
export const dynamic = 'force-static';

export function GET() {
  const variants = [defaultRole, ...ROLE_LENSES].map((lens) => ({
    slug: lens.slug,
    roleTitle: lens.roleTitle,
    route: resumePrintRoute(lens),
    pdfPath: resumePdfPath(lens),
    downloadName: resumeDownloadName(lens),
  }));

  return Response.json({ variants });
}
