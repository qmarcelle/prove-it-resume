import {
  ACTIVE_RESEARCH_QUESTION,
  ARGUMENT_IN_ONE_LINE,
  repositoryLayers,
} from '@/content/proofs/repository-intelligence';
import { repositoryIntelligence } from '@/content/proofs';
import { ClaimBoundary } from '@/components/evidence/ClaimBoundary';
import { EvidenceLink } from '@/components/evidence/EvidenceLink';
import { EvidencePanel } from '@/components/evidence/EvidencePanel';
import { ArchitectureStrip } from '@/components/proof/ArchitectureStrip';
import { RepositoryDecisionDiff } from '@/components/interactions/RepositoryDecisionDiff';
import { repositoryDecision } from '@/content/experiments/repository-decision';
import {
  ProofAside,
  ProofColumns,
  ProofField,
  ProofList,
  ProofProse,
  ProofSection,
} from '@/components/proof/ProofSection';
import styles from './RepositoryIntelligenceSection.module.css';

/**
 * 03 — Repository Intelligence.
 *
 * This is the section most at risk of collapsing into a project gallery, because it
 * names three artifacts. The layout resists that: one vertical chain, read top to
 * bottom, where each layer is the previous layer's consequence — a contract, then an
 * implementation of that contract, then an enterprise integration of that
 * implementation. Three receipts for one argument, not three projects.
 */
const PIPELINE = [
  'REPOSITORY',
  { label: '.agents/workspace.json', accent: true },
  'AGENTS / TOOLS / INTEGRATIONS',
] as const;

export function RepositoryIntelligenceSection() {
  const proof = repositoryIntelligence;

  return (
    <ProofSection proof={proof}>
      <ArchitectureStrip nodes={PIPELINE} />

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

      <RepositoryDecisionDiff code={proof.evidenceCode} data={repositoryDecision} />

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
