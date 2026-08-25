import { PROFILES, RESUME, RESUME_BRIDGE } from '@/content/site';
import { ResumeDownloadLink } from '@/components/resume/ResumeDownloadLink';
import type { RoleLens } from '@/lib/types';
import { isResolved } from '@/lib/evidence';
import styles from './ResumeBridge.module.css';

/**
 * The bridge to the conventional résumé.
 *
 * Kept in the architecture and in the page, because plenty of hiring processes require
 * one and removing it would make the artifact harder to act on, not purer. What is
 * removed is the pretence: a button appears only once the thing behind it exists, and
 * until then the gap is stated where the button would have been.
 *
 * Both destinations resolve now — the generated PDF and the LinkedIn profile — so the
 * explanatory note below renders for neither. The unresolved branches stay anyway; they
 * are what stops a future edit that clears an `href` from silently shipping a 404.
 */
export function ResumeBridge({ lens }: { lens: RoleLens }) {
  const resumeAvailable = isResolved(RESUME);
  const linkedin = PROFILES.find((profile) => profile.id === 'linkedin');
  const linkedinAvailable = linkedin ? isResolved(linkedin) : false;

  return (
    <section className={styles.section} id="resume" aria-labelledby="resume-title">
      <div className={styles.inner}>
        <div className={styles.body}>
          <h2 className={styles.heading} id="resume-title">
            {RESUME_BRIDGE.heading}
          </h2>
          <p className={styles.text}>{RESUME_BRIDGE.body}</p>
        </div>

        <div className={styles.actions}>
          {resumeAvailable ? (
            <ResumeDownloadLink className={styles.primary} lens={lens}>
              Download résumé PDF ↓
            </ResumeDownloadLink>
          ) : (
            <span className={styles.pending}>RÉSUMÉ PDF — NOT YET PUBLISHED</span>
          )}

          {linkedinAvailable && linkedin?.href ? (
            <a
              className={styles.primary}
              href={linkedin.href}
              target="_blank"
              rel="noreferrer noopener"
            >
              View LinkedIn ↗
            </a>
          ) : (
            <span className={styles.pending}>LINKEDIN — NOT PUBLISHED</span>
          )}

          {!resumeAvailable || !linkedinAvailable ? (
            <p className={styles.note}>
              These are wired but unpublished. The evidence above is complete without
              them; a link that resolves to nothing would be worse than its absence.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
