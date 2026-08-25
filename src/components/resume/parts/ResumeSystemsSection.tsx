import type { ResumeSystemFact } from '@/content/resume/facts';
import styles from '../ResumeDocument.module.css';

/**
 * The systems list: one article per system, each with a VERIFY link to the published
 * site it can be checked against.
 *
 * The link is the reason this block exists in this form. A résumé bullet is a claim;
 * a résumé bullet with a URL next to it is a claim someone can go and disprove, and
 * the whole document is arranged around making that cheap. The destinations come from
 * `content/published.ts`, the same list the evidence rows use, so a system whose front
 * door moves cannot end up with a live site on the page and a dead one on the PDF.
 *
 * The first article carries the heavier rule because it opens the section; that is the
 * export's own rhythm and it survives reordering, since "first" is positional rather
 * than a property of any one system.
 */
export function ResumeSystemsSection({
  systems,
  showStack = true,
}: {
  systems: readonly ResumeSystemFact[];
  /**
   * The tool chain under each entry. Suppressed where the projection carries a grouped
   * capability block instead — the two say the same thing, and a two-page sheet cannot
   * afford to say anything twice.
   */
  showStack?: boolean;
}) {
  return (
    <>
      {systems.map((system, index) => (
        <article
          className={index === 0 ? styles.systemLead : styles.system}
          key={system.id}
        >
          <div className={styles.systemHead}>
            <h3 className={system.nameIsCode ? styles.systemNameCode : styles.systemName}>
              {system.name}
            </h3>
            <span className={styles.systemSummary}>{system.summary}</span>
            <a className={styles.verify} href={system.verifyHref}>
              VERIFY ↗
            </a>
          </div>
          <ul className={styles.bullets}>
            {system.bullets.map((bullet) => (
              <li key={bullet.id}>{bullet.text}</li>
            ))}
          </ul>
          {showStack ? <div className={styles.stackLine}>{system.stack}</div> : null}
        </article>
      ))}
    </>
  );
}
