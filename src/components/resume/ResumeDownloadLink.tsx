import { RESUME } from '@/content/site';
import { isResolved } from '@/lib/evidence';
import { resumeDownloadName, resumePdfPath } from '@/lib/resume';
import type { RoleLens } from '@/lib/types';

/**
 * The one place a résumé download can be rendered.
 *
 * Whether a résumé exists at all is still the single `RESUME` evidence record, so the
 * evidence-integrity rule is unchanged: no record, no link. What varies per lens is only
 * *which* generated file to serve, and that comes from `resumePdfPath` rather than from
 * the record, because there is one record and three artifacts.
 *
 * Returns `null` when unresolved. Callers render their own stated gap, because the
 * wording differs by placement — the header says nothing, the bridge explains.
 */
export function ResumeDownloadLink({
  lens,
  className,
  children,
}: {
  lens: RoleLens;
  className?: string;
  children: React.ReactNode;
}) {
  if (!isResolved(RESUME)) return null;

  return (
    <a
      className={className}
      href={resumePdfPath(lens)}
      download={resumeDownloadName(lens)}
    >
      {children}
    </a>
  );
}
