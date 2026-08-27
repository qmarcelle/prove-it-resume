import { interlock } from '@/content/proofs';
import { INTERLOCK_RELEVANCE } from '@/content/proofs/interlock';
import { EvidenceLink } from '@/components/evidence/EvidenceLink';
import { EvidencePanel } from '@/components/evidence/EvidencePanel';
import { InterlockCounterfactual } from '@/components/interactions/InterlockCounterfactual';
import { interlockHac330 } from '@/content/experiments/interlock-hac330';
import { ChapterMark } from '@/components/proof/ChapterMark';
import { ProgressiveDisclosure } from '@/components/interactions/ProgressiveDisclosure';
import { DISCLOSURE_KEYS, requirePath } from '@/lib/disclosure';
import {
  ProofAside,
  ProofChapter,
  ProofColumns,
  ProofLayer,
  ProofLayerBody,
  ProofLayerColumn,
  ProofProse,
  ProofSection,
  ProofThesis,
} from '@/components/proof/ProofSection';
import type { DisclosureCopy, SectionProjection, SurfaceStep } from '@/lib/types';
import styles from './InterlockSection.module.css';

/**
 * 04: Interlock. Spatial grammar: measurement.
 *
 * The chapter furniture turns vertical here and the section reads against a horizontal
 * axis. That is not variety for its own sake: the argument is two arms measured against
 * one constraint, so the page's horizontal axis belongs to the measurement, and the
 * chapter number gets out of its way rather than competing for the same reading
 * direction. Below the two-column break the rail lays back down, because a rotated
 * strip costs a column a narrow viewport does not have.
 *
 * The last bullet, "state explicitly what the experiment does not prove", is emphasised
 * in the markup because it is the point of the section. Everything above it is method;
 * that line is the discipline the method exists to serve.
 */
export function InterlockSection({
  step,
  projection,
}: {
  step?: SurfaceStep;
  /**
   * An application surface's framing and curiosity paths over this proof.
   *
   * Absent on `/`, which enters through the proof's own name and thesis. Where it is
   * supplied the composition problem is stated first and the machinery follows the
   * question the reader chose; the counterfactual, the packet, the distinctions and the
   * boundary are the same blocks, read from the same durable records.
   */
  projection?: SectionProjection;
} = {}) {
  const figure = (
    <InterlockCounterfactual
      data={interlockHac330}
      shareAnchor={interlock.sectionId}
      showControls={false}
      showFooter={false}
    />
  );

  /** Why this belongs in a resume, and the discipline the method exists to serve. */
  const columns = (
    <ProofColumns>
      <ProofProse>
        <div className={styles.relevance}>
          <h3 className={styles.relevanceHeading}>Why this belongs in a résumé</h3>
          <p className={styles.relevanceLead}>{INTERLOCK_RELEVANCE}</p>
          <ul className={styles.list}>
            {interlock.demonstrates.map((item, index) => {
              const isLast = index === interlock.demonstrates.length - 1;
              return (
                <li key={item}>
                  {isLast ? (
                    <>
                      state explicitly what the experiment does{' '}
                      <strong className={styles.emphasis}>not</strong> prove
                    </>
                  ) : (
                    item
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </ProofProse>

      <ProofAside>
        <EvidencePanel
          status={interlock.status}
          code={interlock.evidenceCode}
          rows={interlock.summary}
          evidence={interlock.evidence}
          boundary={interlock.boundary}
        />
      </ProofAside>
    </ProofColumns>
  );

  /** What was held fixed, what the packet insists on, and where the evidence stops. */
  const layer = (
    <ProofLayer>
      <ProofLayerColumn label="HELD FIXED">
        {interlockHac330.controls.heldFixed.map((item) => (
          <ProofLayerBody key={item}>{item}</ProofLayerBody>
        ))}
      </ProofLayerColumn>

      {/*
       * The distinctions the packet insists on, as the packet states them. Rendered
       * as one mono line rather than a list because they are read as a single
       * caveat, and joined from the content so the set cannot quietly shrink.
       */}
      <ProofLayerColumn accent label="THE DISTINCTIONS THE PACKET INSISTS ON">
        <ProofLayerBody>{interlockHac330.distinctions.join(' · ')}</ProofLayerBody>
      </ProofLayerColumn>

      <ProofLayerColumn label="WHAT THIS DOES NOT SHOW" narrow>
        <ProofLayerBody>{interlockHac330.boundary}</ProofLayerBody>
        <EvidenceLink
          cta={interlockHac330.artifact.title}
          reference={interlockHac330.artifact}
        />
        {interlockHac330.verification?.command ? (
          <code className={styles.command}>{interlockHac330.verification.command}</code>
        ) : null}
      </ProofLayerColumn>
    </ProofLayer>
  );

  if (projection) {
    const proofPath = requirePath(projection.paths, 'proof');
    const limits = requirePath(projection.paths, 'limits');

    /*
     * The cloud traversal, as a secondary branch rather than a third invitation.
     *
     * It answers a different question from the counterfactual above it: whether a real
     * authenticated Google ADK / Vertex AI / Cloud Run path crossed the protected
     * boundary and produced separately observed state. Promoting it to a section-level
     * path would imply it completes the local causal argument, and it does not. Its row
     * already says "separate run"; this only gives a reader who walked the proof
     * somewhere to go next.
     */
    const cloud = interlock.evidence.find((row) => row.id === 'ilk-ev-cloud');

    return (
      <ProofSection proof={interlock} step={step}>
        <ProofChapter
          proof={interlock}
          step={step}
          label={`PROOF THREE · ${interlockHac330.experiment}`}
          title={projection.heading}
          lead={projection.body}
        />

        <div className={styles.projection}>
          {projection.secondBeat ? (
            <p className={styles.projectionBeat}>{projection.secondBeat}</p>
          ) : null}

          <ProgressiveDisclosure
            label="Questions this experiment can answer"
            queryKey={DISCLOSURE_KEYS['interlock']}
            paths={[
              {
                ...proofPath,
                // `?interlock=<stage>` was a shareable address before this section had
                // a disclosure, and the control it names is now in here.
                revealedBy: ['interlock'],
                content: (
                  <div className={styles.deepLayer}>
                    <Prose copy={proofPath} />
                    {figure}
                    {columns}
                    {cloud ? (
                      <div className={styles.branch}>
                        <span className={styles.branchLabel}>A DIFFERENT QUESTION</span>
                        <EvidenceLink
                          cta="See the separate cloud traversal"
                          reference={cloud}
                        />
                      </div>
                    ) : null}
                  </div>
                ),
              },
              {
                ...limits,
                content: (
                  <div className={styles.deepLayer}>
                    <Prose copy={limits} />
                    {layer}
                  </div>
                ),
              },
            ]}
          />
        </div>
      </ProofSection>
    );
  }

  return (
    <ProofSection proof={interlock} step={step}>
      {step ? (
        <>
          <ProofChapter
            proof={interlock}
            step={step}
            label={`PROOF THREE · ${interlockHac330.experiment}`}
          />
          {figure}
        </>
      ) : (
        <div className={styles.chapterRow}>
          <ChapterMark
            stage={interlock.stage}
            label={`PROOF THREE · ${interlockHac330.experiment}`}
            orientation="vertical"
          />

          <div className={styles.chapterBody}>
            <h2 className={styles.title} id={`${interlock.id}-title`}>
              {interlock.title}
            </h2>
            <ProofThesis>{interlock.thesis}</ProofThesis>

            {figure}
          </div>
        </div>
      )}

      {columns}
      {layer}
    </ProofSection>
  );
}

/** A disclosure path's prose, with its quieter closing note where it has one. */
function Prose({ copy }: { copy: DisclosureCopy }) {
  return (
    <div className={styles.deepProse}>
      {copy.paragraphs?.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {copy.note ? <p className={styles.deepNote}>{copy.note}</p> : null}
    </div>
  );
}
