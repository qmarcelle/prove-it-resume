import { neverAskTwice } from '@/content/supporting/never-ask-twice';
import { ClaimBoundary } from '@/components/evidence/ClaimBoundary';
import { EvidenceLink } from '@/components/evidence/EvidenceLink';
import styles from './SupportingEvidence.module.css';

/**
 * Additional systems, shown after the three proofs rather than beside them.
 *
 * The framing is load-bearing: "not six side projects — three engineering problems with
 * multiple independent receipts". This section exists so relevant supporting work is
 * findable without turning the page into a project grid, which is why it is one entry
 * in one card and not a row of tiles.
 */
export function SupportingEvidence() {
  const work = neverAskTwice;

  return (
    <section
      className={styles.section}
      id="more-evidence"
      aria-labelledby="more-evidence-title"
    >
      <div className={styles.inner}>
        <p className={styles.eyebrow}>MORE PROOF, IF RELEVANT</p>

        <div className={styles.head}>
          <h2 className={styles.heading} id="more-evidence-title">
            Additional systems
          </h2>
          <p className={styles.lead}>
            Not six side projects. Three engineering problems, with multiple independent
            receipts.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.body}>
            <h3 className={styles.title}>{work.title}</h3>
            <p className={styles.question}>{work.question}</p>
            <p className={styles.summary}>{work.summary}</p>
            <ul className={styles.tags}>
              {work.tags.map((tag) => (
                <li className={styles.tag} key={tag}>
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.meta}>
            <div className={styles.metaBlock}>
              <span className={styles.metaLabel}>SURFACE</span>
              <span className={styles.metaValue}>{work.surface}</span>
            </div>
            <ClaimBoundary variant="note">{work.boundary}</ClaimBoundary>
            <div className={styles.cta}>
              <EvidenceLink
                reference={work.evidence}
                cta="INSPECT PROOF"
                variant="block"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
