import { SITE } from '@/content/site';
import { EvidenceStatus } from '@/components/evidence/EvidenceStatus';
import type { Proof } from '@/lib/types';
import styles from './EvidenceIndex.module.css';

/**
 * The Evidence Index: the three proof paths, above the fold, as ordinary anchors.
 *
 * This is the ten-second answer to "where do I start?", so it stays compact, stays
 * scannable, and stays link-based — it works before hydration, without JavaScript, and
 * from a keyboard with no special handling.
 *
 */
export function EvidenceIndex({ proofs }: { proofs: readonly Proof[] }) {
  return (
    <nav className={styles.index} aria-label="Evidence index">
      <div className={styles.header}>
        <span className={styles.title}>EVIDENCE INDEX</span>
        <span className={styles.revision}>{SITE.revision}</span>
      </div>

      <ol className={styles.list}>
        {proofs.map((proof, index) => (
          <li key={proof.id}>
            <a className={styles.entry} href={`#${proof.sectionId}`}>
              <span className={styles.ordinal}>{String(index + 1).padStart(2, '0')}</span>
              <span className={styles.body}>
                <span className={styles.name}>{proof.title}</span>
                <span
                  className={`${styles.summary} ${proof.listing.summaryIsCode ? styles.summaryCode : ''}`.trim()}
                >
                  {proof.listing.summary}
                </span>
                <EvidenceStatus
                  tone={proof.status.tone}
                  label={proof.status.label}
                  className={styles.status}
                />
              </span>
            </a>
          </li>
        ))}
      </ol>

      <p className={styles.footer}>
        <span>{proofs.length} proof paths</span>
        <span className={styles.footerDivider} aria-hidden="true">
          ·
        </span>
        <a href={SITE.github} target="_blank" rel="noreferrer noopener">
          {SITE.githubLabel} ↗
          <span className="visually-hidden"> — opens in a new tab</span>
        </a>
      </p>
    </nav>
  );
}
