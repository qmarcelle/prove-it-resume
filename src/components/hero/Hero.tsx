import { RESUME, SITE } from '@/content/site';
import { ResumeDownloadLink } from '@/components/resume/ResumeDownloadLink';
import type { AnyLens } from '@/lib/types';
import { isResolved } from '@/lib/evidence';
import { WalkProofButton } from '@/components/proof/WalkProofButton';
import { ActionIcon } from '@/components/icon/Icon';
import { BoundedField } from './BoundedField';
import styles from './Hero.module.css';

/**
 * The words in the hero. The durable site copy is the default; an application lens
 * supplies its own, because the first screen is where an application surface has to
 * establish that it was written for this reader rather than found by them.
 *
 * Framing only — it names no system and states no metric. Everything a reader can
 * check is below the fold, in the proofs, unchanged.
 */
export type HeroFraming = {
  eyebrow: string;
  headline: string;
  thesis: string;
  supporting: string;
  capabilities: readonly string[];
};

const DURABLE_FRAMING: HeroFraming = {
  eyebrow: SITE.eyebrow,
  headline: SITE.headline,
  thesis: SITE.thesis,
  supporting: SITE.supporting,
  capabilities: SITE.capabilities,
};

/**
 * Hero. A Server Component apart from the single "Walk the proof" button, which is the
 * only element here that needs client state.
 *
 * The hierarchy is candidate-first, per the locked visual direction: the person and the
 * claim lead, the thesis supports, and the résumé is a quiet secondary link rather than
 * a competing call to action.
 */
export function Hero({
  lens,
  framing = DURABLE_FRAMING,
  figure,
  children,
}: {
  lens: AnyLens;
  framing?: HeroFraming;
  /**
   * The composition under the Evidence Index. Defaults to the durable page's bounded
   * path; an application surface may open on a different argument.
   *
   * A prop rather than a branch on `lens`, because the hero has no business knowing
   * which surfaces exist — and because a figure is the one part of this section that is
   * genuinely a composition decision rather than a copy decision.
   */
  figure?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const resumeAvailable = isResolved(RESUME);

  return (
    <section className={styles.hero} id="top">
      <div className={styles.inner}>
        <div className={styles.lede}>
          <p className={styles.eyebrow}>{framing.eyebrow}</p>
          <h1 className={styles.headline}>{framing.headline}</h1>
          <p className={styles.thesis}>{framing.thesis}</p>
          <p className={styles.supporting}>{framing.supporting}</p>

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
            {framing.capabilities.map((capability) => (
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
          {figure ?? <BoundedField />}
        </div>
      </div>
    </section>
  );
}
