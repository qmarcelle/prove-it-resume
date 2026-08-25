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
import { ChapterMark } from '@/components/proof/ChapterMark';
import { HeldFixedRail } from '@/components/proof/HeldFixedRail';
import {
  ProofAside,
  ProofColumns,
  ProofField,
  ProofLayer,
  ProofLayerBody,
  ProofLayerColumn,
  ProofList,
  ProofMasthead,
  ProofProse,
  ProofSection,
  ProofSignature,
  ProofThesis,
} from '@/components/proof/ProofSection';
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
export function RepositoryIntelligenceSection() {
  const proof = repositoryIntelligence;

  return (
    <ProofSection proof={proof}>
      <ProofSignature>
        <ProofMasthead>
          <ChapterMark
            stage={proof.stage}
            label={`PROOF TWO · ${repositoryDecision.experiment}`}
            meta="ONE RECORDED RUN · FROZEN ARTIFACT"
            title={proof.title}
            titleId={`${proof.id}-title`}
            orientation="inline"
            tone="dark"
          />
          <ProofThesis>{proof.thesis}</ProofThesis>
        </ProofMasthead>

        <div className={styles.signatureRow}>
          <HeldFixedRail
            heldFixed={repositoryDecision.controls.heldFixed}
            varied={repositoryDecision.controls.varied}
          />
          <div className={styles.signatureStage}>
            <RepositoryDecisionDiff
              code={proof.evidenceCode}
              data={repositoryDecision}
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
