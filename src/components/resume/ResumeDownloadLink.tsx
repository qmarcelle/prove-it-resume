import { RESUME } from '@/content/site';
import { ActionIcon } from '@/components/icon/Icon';
import type { IconSize } from '@/components/icon/Icon';
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
 *
 * The label and its download mark are bound together here rather than assembled by each
 * caller. Five placements spelling their own `Résumé ↓` is five chances for one of them
 * to drift, and the mark is load-bearing: this is the only affordance on the site that
 * puts a file on the reader's disk, and it used to share `↓` with scrolling down the
 * page and with opening a disclosure.
 *
 * `children` is anything that should sit *after* the label as a sibling — the bridge's
 * page count, which its own layout spaces apart.
 */
export function ResumeDownloadLink({
  lens,
  className,
  label,
  iconSize = 12,
  children,
}: {
  lens: RoleLens;
  className?: string;
  label: string;
  iconSize?: IconSize;
  children?: React.ReactNode;
}) {
  if (!isResolved(RESUME)) return null;

  return (
    <a
      className={className}
      href={resumePdfPath(lens)}
      download={resumeDownloadName(lens)}
    >
      <span>
        {label}
        <ActionIcon affordance="download-file" size={iconSize} />
      </span>
      {children}
    </a>
  );
}
