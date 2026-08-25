import { RESUME, SITE } from '@/content/site';
import { ResumeDownloadLink } from '@/components/resume/ResumeDownloadLink';
import type { RoleLens } from '@/lib/types';
import { isResolved } from '@/lib/evidence';
import { WalkProofButton } from '@/components/proof/WalkProofButton';
import { ActionIcon } from '@/components/icon/Icon';
import { BoundedField } from './BoundedField';
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
            <WalkProofButton affordance="advance-sequence" className={styles.primary}>
              Walk the proof
            </WalkProofButton>

            <div className={styles.secondary}>
              <a href={SITE.github} target="_blank" rel="noreferrer noopener">
                GitHub
                <ActionIcon affordance="visit-external-site" size={12} />
                <span className="visually-hidden"> — opens in a new tab</span>
              </a>
              <span className={styles.divider} aria-hidden="true">
                ·
              </span>
              {resumeAvailable ? (
                <ResumeDownloadLink label="Résumé" lens={lens} />
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

        {/*
         * The right column: the ten-second answer first, then the picture of what the
         * answer is about. Order matters — the Evidence Index is what a reader in a
         * hurry came for, and a composition above it would put a drawing between them
         * and the links. Below it, the stage fills a column that was otherwise empty
         * from the index down, so the hero gains a figure without gaining much height.
         */}
        <div className={styles.aside}>
          {children}
          <BoundedField />
        </div>
      </div>
    </section>
  );
}
