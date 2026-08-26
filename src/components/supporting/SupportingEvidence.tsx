import { neverAskTwice } from '@/content/supporting/never-ask-twice';
import { ClaimBoundary } from '@/components/evidence/ClaimBoundary';
import { EvidenceLink } from '@/components/evidence/EvidenceLink';
import { SectionHead, sectionFrameClass } from '@/components/section/SectionFrame';
import type { SurfaceStep } from '@/lib/types';
import styles from './SupportingEvidence.module.css';

/**
 * The framing around the entry. Durable on `/`; an application surface that promotes
 * this work out of the appendix supplies its own, because "additional systems" is the
 * wrong sentence above something the reader was sent here to see.
 *
 * Copy only. The work, its question, its surface, its boundary, and its evidence row
 * all come from `neverAskTwice` on every surface, so promoting it changes where it sits
 * and what is said *about* it, never what it claims.
 */
export type SupportingFraming = {
  /** Absent where a page plan supplies the section's identity instead. */
  eyebrow?: string;
  heading: string;
  lead: string;
};

const DURABLE_FRAMING: SupportingFraming = {
  eyebrow: 'MORE PROOF, IF RELEVANT',
  heading: 'Additional systems',
  lead: 'Not six side projects. Three engineering problems, with multiple independent receipts.',
};

/**
 * Additional systems, shown after the three proofs rather than beside them.
 *
 * The framing is load-bearing: "not six side projects; three engineering problems with
 * multiple independent receipts". This section exists so relevant supporting work is
 * findable without turning the page into a project grid, which is why it is one entry
 * in one card and not a row of tiles.
 */
export function SupportingEvidence({
  framing = DURABLE_FRAMING,
  step,
}: {
  framing?: SupportingFraming;
  /**
   * The page-plan step this section was placed as, on a surface that has one.
   *
   * Optional because `/` has no plan: it renders the durable six in a fixed order and
   * this entry is its appendix, unnumbered by design. Where a step *is* supplied the
   * section takes its number, eyebrow and frame from it and states none of its own,
   * which is what stops a promoted appendix from arriving on an application surface
   * with no place in that surface's sequence.
   */
  step?: SurfaceStep;
} = {}) {
  const work = neverAskTwice;

  return (
    <section
      className={`${styles.section} ${sectionFrameClass(step)}`.trim()}
      id={step ? step.id : 'never-ask-twice'}
      aria-labelledby="never-ask-twice-title"
    >
      {step ? (
        <SectionHead
          step={step}
          title={framing.heading}
          titleId="never-ask-twice-title"
          lead={framing.lead}
        />
      ) : null}

      <div className={styles.inner}>
        {step ? null : (
          <>
            <p className={styles.eyebrow}>{framing.eyebrow}</p>

            <div className={styles.head}>
              <h2 className={styles.heading} id="never-ask-twice-title">
                {framing.heading}
              </h2>
              <p className={styles.lead}>{framing.lead}</p>
            </div>
          </>
        )}

        <div className={styles.card}>
          <div className={styles.body}>
            {/*
             * On `/` the section is called "Additional systems" and the card names the
             * work. Where a page plan promotes this entry the plan's own head names it,
             * and repeating the title immediately underneath reads as two things rather
             * than one.
             */}
            {step ? null : <h3 className={styles.title}>{work.title}</h3>}
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
