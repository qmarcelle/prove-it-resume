import { RESUME, SITE } from '@/content/site';
import { ResumeDownloadLink } from '@/components/resume/ResumeDownloadLink';
import type { RoleLens } from '@/lib/types';
import { isResolved } from '@/lib/evidence';
import { WalkProofButton } from '@/components/proof/WalkProofButton';
import styles from './Hero.module.css';

/**
 * Hero. A Server Component apart from the single "Walk the proof" button, which is the
 * only element here that needs client state.
 *
 * The hierarchy is candidate-first, per the locked visual direction: the person and the
 * claim lead, the thesis supports, and the résumé is a quiet secondary link rather than
 * a competing call to action.
 */
export function Hero({ lens, children }: { lens: RoleLens; children?: React.ReactNode }) {
  const resumeAvailable = isResolved(RESUME);

  return (
    <section className={styles.hero} id="top">
      <div className={styles.inner}>
        <div className={styles.lede}>
          <p className={styles.eyebrow}>{SITE.eyebrow}</p>
          <h1 className={styles.headline}>{SITE.headline}</h1>
          <p className={styles.thesis}>{SITE.thesis}</p>
          <p className={styles.supporting}>{SITE.supporting}</p>

          <div className={styles.actions}>
            <WalkProofButton className={styles.primary}>Walk the proof →</WalkProofButton>

            <div className={styles.secondary}>
              <a href={SITE.github} target="_blank" rel="noreferrer noopener">
                GitHub ↗<span className="visually-hidden"> — opens in a new tab</span>
              </a>
              <span className={styles.divider} aria-hidden="true">
                ·
              </span>
              {resumeAvailable ? (
                <ResumeDownloadLink lens={lens}>Résumé ↓</ResumeDownloadLink>
              ) : (
                <span className={styles.pending}>Résumé — not yet published</span>
              )}
            </div>
          </div>

          <ul className={styles.capabilities}>
            {SITE.capabilities.map((capability) => (
              <li className={styles.capability} key={capability}>
                {capability}
              </li>
            ))}
          </ul>
        </div>

        {children}
      </div>
    </section>
  );
}
