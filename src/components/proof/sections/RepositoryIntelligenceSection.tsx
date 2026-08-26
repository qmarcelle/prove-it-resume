import {
  ACTIVE_RESEARCH_QUESTION,
  ARGUMENT_IN_ONE_LINE,
  repositoryLayers,
} from '@/content/proofs/repository-intelligence';
import { repositoryIntelligence } from '@/content/proofs';
import { ClaimBoundary } from '@/components/evidence/ClaimBoundary';
import { EvidenceLink } from '@/components/evidence/EvidenceLink';
import { EvidencePanel } from '@/components/evidence/EvidencePanel';
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
import type { SurfaceStep } from '@/lib/types';
import styles from './RepositoryIntelligenceSection.module.css';

/**
 * 03 — Repository Intelligence. Spatial grammar: causality.
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
 * the previous one's consequence — a contract, an implementation of that contract, an
 * enterprise integration of that implementation. Three receipts for one argument.
 *
 * The `ArchitectureStrip` that used to open the section is gone: it restated the chain
 * immediately below it as a single line of boxes, which is the "repeated heading →
 * rule → same-width opener" rhythm the redesign set out to remove.
 */
export function RepositoryIntelligenceSection({ step }: { step?: SurfaceStep } = {}) {
  const proof = repositoryIntelligence;

  /*
   * The chapter furniture leaves the signature block when the surface has a page plan.
   *
   * On `/` the head belongs inside the inverted band: the band *is* the chapter, and a
   * heading floating above it on light ground would read as a second opener. On a lens
   * surface the band is one block inside a section the plan has already framed and
   * numbered, so the head sits where every other section's head sits and the signature
   * becomes what it actually is — the figure.
   */
  const chapter = (
    <ProofChapter
      proof={proof}
      step={step}
      label={`PROOF TWO · ${repositoryDecision.experiment}`}
      meta="ONE RECORDED RUN · FROZEN ARTIFACT"
      orientation="inline"
      tone="dark"
    />
  );

  return (
    <ProofSection proof={proof} step={step}>
      {step ? chapter : null}

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
                <h3
                  className={layer.nameIsCode ? styles.layerNameCode : styles.layerName}
                >
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

      <div className={styles.argument}>
        <span className={styles.argumentLabel}>THE ARGUMENT IN ONE LINE</span>
        <p className={styles.argumentBody}>{ARGUMENT_IN_ONE_LINE}</p>
      </div>

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
    </ProofSection>
  );
}
