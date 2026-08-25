import { FINAL_CTA, RESUME, SITE } from '@/content/site';
import { ResumeDownloadLink } from '@/components/resume/ResumeDownloadLink';
import type { RoleLens } from '@/lib/types';
import { isResolved } from '@/lib/evidence';
import { WalkProofButton } from '@/components/proof/WalkProofButton';
import { ActionIcon } from '@/components/icon/Icon';
import styles from './FinalCta.module.css';

export function FinalCta({ lens }: { lens: RoleLens }) {
  const resumeAvailable = isResolved(RESUME);

  return (
    <section className={styles.section} aria-labelledby="final-cta-title">
      <div className={styles.inner}>
        <h2 className={styles.heading} id="final-cta-title">
          {FINAL_CTA.heading}
        </h2>
        <p className={styles.body}>{FINAL_CTA.body}</p>

        <div className={styles.actions}>
          <WalkProofButton affordance="move-up-page" className={styles.primary}>
            Walk the proof again
          </WalkProofButton>
          <a
            className={styles.secondary}
            href={SITE.github}
            target="_blank"
            rel="noreferrer noopener"
          >
            GitHub
            <ActionIcon affordance="visit-external-site" size={14} />
            <span className="visually-hidden"> — opens in a new tab</span>
          </a>
          {resumeAvailable ? (
            <ResumeDownloadLink
              className={styles.secondary}
              iconSize={14}
              label="Résumé PDF"
              lens={lens}
            />
          ) : (
            <span className={styles.pending}>RÉSUMÉ — NOT YET PUBLISHED</span>
          )}
        </div>

        <div className={styles.signature}>
          <span className={styles.signatureName}>
            {SITE.name} · {SITE.role}
          </span>
          <span className={styles.signatureRole}>{SITE.affiliation}</span>
        </div>
      </div>
    </section>
  );
}
