import { neverAskTwice } from '@/content/supporting/never-ask-twice';
import { ClaimBoundary } from '@/components/evidence/ClaimBoundary';
import { EvidenceLink } from '@/components/evidence/EvidenceLink';
import { ProgressiveDisclosure } from '@/components/interactions/ProgressiveDisclosure';
import { SectionHead, sectionFrameClass } from '@/components/section/SectionFrame';
import { DISCLOSURE_KEYS, requirePath } from '@/lib/disclosure';
import type {
  DisclosureCopy,
  SectionProjection,
  SupportingArtifacts,
  SurfaceStep,
} from '@/lib/types';
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
  projection,
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
  /**
   * An application surface's curiosity paths over this work.
   *
   * Absent on `/`, where the entry is an appendix card and a reader who has scrolled
   * that far is already past the point of needing to be invited. Where it is supplied
   * the card does not disappear: it moves inside the evaluation path, whole, because
   * the question, the tags, the surface, the boundary and the evidence row are the
   * durable record and this pass reorders evidence rather than removing it.
   */
  projection?: SectionProjection;
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

        {projection ? (
          <>
            {projection.secondBeat ? (
              <p className={styles.orientation}>{projection.secondBeat}</p>
            ) : null}

            <ProgressiveDisclosure
              label="Questions this system can answer"
              queryKey={DISCLOSURE_KEYS['never-ask-twice']}
              paths={[
                {
                  ...requirePath(projection.paths, 'failures'),
                  content: <Prose copy={requirePath(projection.paths, 'failures')} />,
                },
                {
                  ...requirePath(projection.paths, 'evaluation'),
                  content: (
                    <div className={styles.deepLayer}>
                      <Prose copy={requirePath(projection.paths, 'evaluation')} />
                      {/*
                       * The durable card, entire. The reader asked how the memory was
                       * tested, and the record's own boundary is the answer to the
                       * question underneath that one: tested how *far*.
                       */}
                      <Card step={step} work={work} />
                    </div>
                  ),
                },
              ]}
            />
          </>
        ) : (
          <Card step={step} work={work} />
        )}

        {/*
         * The live product, on the surfaces that promoted this work.
         *
         * Not inside the evaluation path, which is where the proof lives: a reader who
         * asked how memory was *tested* did not ask for a demo, and putting the running
         * agent behind that question would make reaching it depend on choosing the one
         * artifact it is not. Not above the invitations either. It sits under them,
         * which is what "subordinate to the curiosity paths" means in layout.
         *
         * Absent on `/`, where this is the appendix and is deliberately one entry in one
         * card. A reader who has scrolled past three proofs to reach it is being offered
         * a pointer, not a product tour, and the card's own `INSPECT PROOF` is the right
         * single exit there. The record carries all three artifacts either way, so this
         * is a decision about what a surface shows, not about what is known.
         */}
        {projection ? <LiveProduct artifacts={work.evidence} /> : null}
      </div>
    </section>
  );
}

/**
 * The deployed product, and the sentence that stops it being read as the proof.
 *
 * A running agent a reader can talk to is the most persuasive thing this record has and
 * the least probative. It establishes that the product exists, is reachable, and works;
 * it establishes nothing about the deterministic ablation, which runs against fixed
 * fixtures and a stubbed client precisely so that its scoring does not depend on a live
 * model. Both facts are true and the page has to hold them apart, so the role is
 * labelled rather than left to the reader to infer from a URL.
 *
 * Durable copy: the distinction is a property of the record, not of a surface, and it
 * would be the same sentence written twice if each surface framed it.
 */
function LiveProduct({ artifacts }: { artifacts: SupportingArtifacts }) {
  if (!artifacts.deployment) return null;

  return (
    <div className={styles.live}>
      <p className={styles.liveLabel}>LIVE PRODUCT</p>
      <p className={styles.liveNote}>
        Publicly reachable and running. It shows the product working. It is not the
        deterministic evaluation, which is a separate artifact carrying its own boundary.
      </p>
      <div className={styles.liveLinks}>
        {/*
         * `visit-external-site`, not the CTA-inferred `inspect-artifact`. These are
         * living pages, and this site draws that distinction deliberately.
         */}
        <EvidenceLink
          affordance="visit-external-site"
          cta="TRY THE LIVE SUPPORT AGENT"
          reference={artifacts.deployment}
        />
        {artifacts.inspector ? (
          <EvidenceLink
            affordance="visit-external-site"
            cta="INSPECT RECALLED FACTS"
            reference={artifacts.inspector}
          />
        ) : null}
      </div>
    </div>
  );
}

/** A disclosure path's prose, with its quieter closing note where it has one. */
function Prose({ copy }: { copy: DisclosureCopy }) {
  return (
    <div className={styles.deep}>
      {copy.paragraphs?.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {copy.note ? <p className={styles.register}>{copy.note}</p> : null}
    </div>
  );
}

/**
 * The durable entry: what it asks, what it is, what it runs on, where it stops, and the
 * one thing a reader can open. Identical on every surface; only its position moves.
 */
function Card({ step, work }: { step?: SurfaceStep; work: typeof neverAskTwice }) {
  return (
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
          {/*
           * The evaluation, and only the evaluation. `INSPECT PROOF` is a claim about
           * what is on the other side, so the live deployment may never resolve here.
           */}
          <EvidenceLink
            cta="INSPECT PROOF"
            reference={work.evidence.evaluation}
            variant="block"
          />
        </div>
      </div>
    </div>
  );
}
