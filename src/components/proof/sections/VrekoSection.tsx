import { vreko } from '@/content/proofs';
import { EvidenceLink } from '@/components/evidence/EvidenceLink';
import { EvidencePanel } from '@/components/evidence/EvidencePanel';
import { ProofScan } from '@/components/proof/ProofScan';
import { VrekoArchitectureTrace } from '@/components/interactions/VrekoArchitectureTrace';
import { vrekoArchitecture } from '@/content/experiments/vreko-architecture';
import {
  ProofChapter,
  ProofColumns,
  ProofLayer,
  ProofLayerBody,
  ProofLayerColumn,
  ProofSection,
} from '@/components/proof/ProofSection';
import type { SurfaceStep } from '@/lib/types';

/**
 * 02 — Vreko. Spatial grammar: containment.
 *
 * The argument this section has to make is about a boundary — what is published, what
 * is declared but not, and where inspection stops. So the layout is nested boxes you
 * open in place, and the publication state is carried by the stroke of each box rather
 * than by a badge beside it.
 *
 * The scan layer answers the section in four lines before the diagram appears, because
 * an evaluator skimming for fit should not have to drive an interaction to find out
 * what is being claimed. `LIMIT` restates the proof's own boundary rather than a
 * softened version of it — the scan layer is allowed to be shorter than the proof
 * layer, never kinder than it.
 */
export function VrekoSection({ step }: { step?: SurfaceStep } = {}) {
  /*
   * PROBLEM and BUILT are the proof's own fields. EVIDENCE is counted from the package
   * lists rather than written down, so the sentence cannot drift from the split it
   * describes, and LIMIT restates a recorded contradiction verbatim.
   */
  const scan = [
    ...vreko.fields.map((field) => ({ label: field.label, body: field.body })),
    {
      label: 'EVIDENCE',
      body:
        `${vrekoArchitecture.publicPackages.length} published packages, ` +
        `${vrekoArchitecture.privatePackages.length} declared and unpublished. ` +
        'Checkable in one command.',
    },
    { label: 'LIMIT', body: vrekoArchitecture.discrepancies[2].summary },
  ];

  return (
    <ProofSection proof={vreko} step={step}>
      <ProofChapter
        proof={vreko}
        step={step}
        label="PROOF ONE"
        orientation="horizontal"
      />

      <ProofScan items={scan} />

      <VrekoArchitectureTrace data={vrekoArchitecture} shareAnchor={vreko.sectionId} />

      {/* `EvidencePanel` sizes itself as a flex row item; a row of one stretches it. */}
      <ProofColumns>
        <EvidencePanel
          status={vreko.status}
          code={vreko.evidenceCode}
          rows={vreko.summary}
          evidence={vreko.evidence}
          boundary={vreko.boundary}
        />
      </ProofColumns>

      <ProofLayer>
        <ProofLayerColumn
          accent
          label={`RECORDED CONTRADICTIONS · ${vrekoArchitecture.discrepancies.length}`}
        >
          {vrekoArchitecture.discrepancies.map((discrepancy) => (
            <ProofLayerBody key={discrepancy.id}>{discrepancy.summary}</ProofLayerBody>
          ))}
          <ProofLayerBody>Kept as recorded, not resolved by guessing.</ProofLayerBody>
        </ProofLayerColumn>

        <ProofLayerColumn label="WHAT THIS DOES NOT SHOW">
          <ProofLayerBody>{vreko.boundary}</ProofLayerBody>
        </ProofLayerColumn>

        <ProofLayerColumn label="INSPECT" narrow>
          {vrekoArchitecture.sources.map((source) => (
            <EvidenceLink cta={source.title} key={source.id} reference={source} />
          ))}
        </ProofLayerColumn>
      </ProofLayer>
    </ProofSection>
  );
}
