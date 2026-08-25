import { interlock } from '@/content/proofs';
import { INTERLOCK_RELEVANCE } from '@/content/proofs/interlock';
import { EvidencePanel } from '@/components/evidence/EvidencePanel';
import { InterlockCounterfactual } from '@/components/interactions/InterlockCounterfactual';
import { interlockHac330 } from '@/content/experiments/interlock-hac330';
import {
  ProofAside,
  ProofColumns,
  ProofProse,
  ProofSection,
} from '@/components/proof/ProofSection';
import styles from './InterlockSection.module.css';

/**
 * 04 — Interlock.
 *
 * The last bullet, "state explicitly what the experiment does not prove", is emphasised
 * in the markup because it is the point of the section. Everything above it is method;
 * that line is the discipline the method exists to serve.
 */
export function InterlockSection() {
  return (
    <ProofSection proof={interlock}>
      <InterlockCounterfactual data={interlockHac330} />

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
    </ProofSection>
  );
}
