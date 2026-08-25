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
 * removed is the pretence: no file was supplied, so there is no download button that
 * would 404, and the gap is stated where the button would have been.
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
