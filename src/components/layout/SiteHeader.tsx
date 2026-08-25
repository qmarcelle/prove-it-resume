import { RESUME, SITE } from '@/content/site';
import { ResumeDownloadLink } from '@/components/resume/ResumeDownloadLink';
import type { RoleLens } from '@/lib/types';
import { isResolved } from '@/lib/evidence';
import styles from './SiteHeader.module.css';

/**
 * Sticky header. Server Component — nothing here needs client JavaScript.
 *
 * The in-page nav is a real `<nav>` of ordinary anchors, so it works before hydration
 * and without JavaScript entirely.
 */
export function SiteHeader({
  showAvailability,
  lens,
}: {
  showAvailability: boolean;
  lens: RoleLens;
}) {
  const resumeAvailable = isResolved(RESUME);

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <a className={styles.wordmark} href="#top">
          <span className={styles.wordmarkName}>{SITE.wordmark}</span>
          <span className={styles.wordmarkSuffix}>{SITE.wordmarkSuffix}</span>
        </a>

        <nav className={styles.nav} aria-label="Sections">
          <a href="#sec-02">Proof</a>
          <a href="#sec-03">Systems</a>
          <a href="#sec-05">Role Fit</a>
          <a href="#sec-06">Career</a>
          <a href="#about">About</a>
        </nav>

        <div className={styles.actions}>
          <a href={SITE.github} target="_blank" rel="noreferrer noopener">
            GitHub ↗<span className="visually-hidden"> — opens in a new tab</span>
          </a>
          {resumeAvailable ? (
            <ResumeDownloadLink className={styles.resume} lens={lens}>
              Résumé PDF ↓
            </ResumeDownloadLink>
          ) : (
            <span className={styles.resumeUnavailable}>Résumé — not yet published</span>
          )}
        </div>
      </div>

      {showAvailability ? (
        <div className={styles.availability}>
          <p className={styles.availabilityInner}>
            <span className={styles.availabilityMark} aria-hidden="true" />
            {SITE.availability}
          </p>
        </div>
      ) : null}
    </header>
  );
}
