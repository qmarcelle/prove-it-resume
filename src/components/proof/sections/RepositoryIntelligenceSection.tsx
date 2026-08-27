import {
  ACTIVE_RESEARCH_QUESTION,
  ARGUMENT_IN_ONE_LINE,
  repositoryLayers,
} from '@/content/proofs/repository-intelligence';
import { repositoryIntelligence } from '@/content/proofs';
import { ClaimBoundary } from '@/components/evidence/ClaimBoundary';
import { EvidenceLink } from '@/components/evidence/EvidenceLink';
import { EvidencePanel } from '@/components/evidence/EvidencePanel';
import { ProgressiveDisclosure } from '@/components/interactions/ProgressiveDisclosure';
import { RepositoryDecisionDiff } from '@/components/interactions/RepositoryDecisionDiff';
import { repositoryDecision } from '@/content/experiments/repository-decision';
import { HeldFixedRail } from '@/components/proof/HeldFixedRail';
import {
  ProofAside,
  ProofChapter,
  ProofColumns,
  ProofField,
  ProofLayer,
  ProofLayerBody,
  ProofLayerColumn,
  ProofList,
  ProofProse,
  ProofSection,
  ProofSignature,
} from '@/components/proof/ProofSection';
import { DISCLOSURE_KEYS, requirePath } from '@/lib/disclosure';
import type { DisclosureCopy, SectionProjection, SurfaceStep } from '@/lib/types';
import styles from './RepositoryIntelligenceSection.module.css';

/**
 * 03: Repository Intelligence. Spatial grammar: causality.
 *
 * This is the section most at risk of collapsing into a project gallery, because it
 * names three artifacts. The layout resists that in two moves.
 *
 * First, the recorded run leads, in the page's one inverted band: a rail of the
 * conditions that were held fixed, and beside it the single control that rewrites the
 * decision. Cause on the left, consequence on the right, and the reason the comparison
 * is worth trusting stays on screen while the consequence is read.
 *
 * Second, the three layers follow on light ground as one vertical chain where each is
 * the previous one's consequence: a contract, an implementation of that contract, an
 * enterprise integration of that implementation. Three receipts for one argument.
 *
 * The `ArchitectureStrip` that used to open the section is gone: it restated the chain
 * immediately below it as a single line of boxes, which is the "repeated heading →
 * rule → same-width opener" rhythm the redesign set out to remove.
 *
 * ## Two orders over one set of blocks
 *
 * An application surface enters this proof through its research question rather than
 * through its infrastructure, so the same blocks are composed in a different order:
 * orientation first, then the machinery behind whichever question the reader chose.
 * They are the *same* blocks, built once below and arranged twice, because the failure
 * mode here is a second copy of the evidence that drifts from the first.
 *
 * What the projection may change is the opening question and the order. It may not
 * change what the run establishes, and it does not: the boundary, the evidence panel,
 * the frozen artifact and the layer links are all read from the durable proof.
 */
export function RepositoryIntelligenceSection({
  step,
  projection,
}: {
  step?: SurfaceStep;
  /**
   * An application surface's framing and curiosity paths over this proof.
   *
   * Absent on `/`, which enters through the proof's own name and thesis.
   */
  projection?: SectionProjection;
} = {}) {
  const proof = repositoryIntelligence;

  /*
   * The chapter furniture leaves the signature block when the surface has a page plan.
   *
   * On `/` the head belongs inside the inverted band: the band *is* the chapter, and a
   * heading floating above it on light ground would read as a second opener. On a lens
   * surface the band is one block inside a section the plan has already framed and
   * numbered, so the head sits where every other section's head sits and the signature
   * becomes what it actually is: the figure.
   */
  const chapter = (
    <ProofChapter
      proof={proof}
      step={step}
      label={`PROOF TWO · ${repositoryDecision.experiment}`}
      meta="ONE RECORDED RUN · FROZEN ARTIFACT"
      orientation="inline"
      tone="dark"
      title={projection?.heading}
      lead={projection?.body}
    />
  );

  /** The recorded run: what was held fixed, and the control that rewrites the decision. */
  const signature = (
    <ProofSignature>
      {step ? null : chapter}

      <div className={styles.signatureRow}>
        <HeldFixedRail
          heldFixed={repositoryDecision.controls.heldFixed}
          varied={repositoryDecision.controls.varied}
        />
        <div className={styles.signatureStage}>
          <RepositoryDecisionDiff
            code={proof.evidenceCode}
            data={repositoryDecision}
            shareAnchor={proof.sectionId}
            showControls={false}
            showFooter={false}
          />
        </div>
      </div>

      <ProofLayer tone="dark">
        <ProofLayerColumn accent label="WHAT THIS RUN DOES NOT ESTABLISH">
          <ProofLayerBody>{repositoryDecision.boundary}</ProofLayerBody>
        </ProofLayerColumn>
        <ProofLayerColumn label="INSPECT THE RUN" narrow>
          <EvidenceLink
            cta={repositoryDecision.artifact.title}
            reference={repositoryDecision.artifact}
          />
        </ProofLayerColumn>
      </ProofLayer>
    </ProofSignature>
  );

  /** The chain: a contract, an implementation of it, an enterprise integration of that. */
  const layers = (
    <div className={styles.layers}>
      <span className={styles.layersLabel}>THREE LAYERS · ONE PROOF</span>

      {repositoryLayers.map((layer, index) => (
        <div key={layer.id}>
          <div
            className={[
              styles.layer,
              index === 0 ? styles.layerFirst : '',
              layer.emphasis ? styles.layerEmphasis : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className={styles.layerHead}>
              <span className={styles.kicker}>{layer.kicker}</span>
              <h3 className={layer.nameIsCode ? styles.layerNameCode : styles.layerName}>
                {layer.name}
              </h3>
              {layer.subtitle ? (
                <span className={styles.layerSubtitle}>{layer.subtitle}</span>
              ) : null}
            </div>

            <div className={styles.layerBody}>
              {layer.body.map((paragraph) => (
                <p className={styles.layerText} key={paragraph.slice(0, 40)}>
                  {paragraph}
                </p>
              ))}
              <ul className={styles.tags}>
                {layer.tags.map((tag) => (
                  <li className={styles.tag} key={tag}>
                    {tag}
                  </li>
                ))}
              </ul>
              {layer.link ? (
                <span className={styles.layerLink}>
                  <EvidenceLink reference={layer.link.ref} cta={layer.link.label} />
                </span>
              ) : null}
            </div>
          </div>

          {index < repositoryLayers.length - 1 ? (
            <div className={styles.connector} aria-hidden="true">
              <span className={styles.connectorRule} />↓
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );

  const argument = (
    <div className={styles.argument}>
      <span className={styles.argumentLabel}>THE ARGUMENT IN ONE LINE</span>
      <p className={styles.argumentBody}>{ARGUMENT_IN_ONE_LINE}</p>
    </div>
  );

  /** The durable prose columns and the evidence panel beside them. */
  const columns = (
    <ProofColumns>
      <ProofProse>
        {proof.fields.map((field) => (
          <ProofField label={field.label} key={field.label}>
            {field.body}
          </ProofField>
        ))}

        <div className={styles.research}>
          <span className={styles.researchLabel}>
            <span className={styles.researchMark} aria-hidden="true" />
            ACTIVE RESEARCH QUESTION
          </span>
          <p className={styles.researchBody}>{ACTIVE_RESEARCH_QUESTION}</p>
        </div>

        <ProofList label="WHAT THIS DEMONSTRATES" items={proof.demonstrates} />
      </ProofProse>

      <ProofAside>
        <EvidencePanel
          status={proof.status}
          code={proof.evidenceCode}
          rows={proof.summary}
          evidence={proof.evidence}
          boundary={proof.boundary}
        />
        {proof.boundaryNote ? (
          <ClaimBoundary variant="note" label="BOUNDARY NOTE">
            {proof.boundaryNote}
          </ClaimBoundary>
        ) : null}
      </ProofAside>
    </ProofColumns>
  );

  if (projection) {
    const baseline = requirePath(projection.paths, 'baseline');
    const path = requirePath(projection.paths, 'path');

    return (
      <ProofSection proof={proof} step={step}>
        {chapter}

        <div className={styles.projection}>
          {projection.secondBeat ? (
            <p className={styles.projectionBeat}>{projection.secondBeat}</p>
          ) : null}

          {/*
           * Status as three separate facts rather than one omnibus badge.
           *
           * A reader entering through the research question is being asked to hold
           * "this is built and public" and "this is still being characterised" at the
           * same time, and a single `IMPLEMENTED` chip collapses them into whichever
           * one flatters. The words come from the durable proof's own status and
           * boundary; only the separation is this surface's.
           */}
          <dl className={styles.dimensions}>
            <div className={styles.dimension}>
              <dt>Contract</dt>
              <dd>public · implemented</dd>
            </div>
            <div className={styles.dimension}>
              <dt>Integrations</dt>
              <dd>public · implemented where evidenced</dd>
            </div>
            <div className={styles.dimension}>
              <dt>Causal research</dt>
              <dd>active · being characterised</dd>
            </div>
          </dl>

          <ProgressiveDisclosure
            label="Questions this research can answer"
            queryKey={DISCLOSURE_KEYS['repository-intelligence']}
            paths={[
              {
                ...baseline,
                content: (
                  <div className={styles.deepLayer}>
                    <Prose copy={baseline} />
                    {argument}
                    {columns}
                  </div>
                ),
              },
              {
                ...path,
                // Same reasoning: `?decision=<stage>` names the recorded run's control,
                // which this path now contains.
                revealedBy: ['decision'],
                content: (
                  <div className={styles.deepLayer}>
                    {layers}
                    {signature}
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
    <ProofSection proof={proof} step={step}>
      {step ? chapter : null}
      {signature}
      {layers}
      {argument}
      {columns}
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
      {copy.note ? <ClaimBoundary variant="note">{copy.note}</ClaimBoundary> : null}
    </div>
  );
}
