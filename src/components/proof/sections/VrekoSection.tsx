import { vreko } from '@/content/proofs';
import { EvidencePanel } from '@/components/evidence/EvidencePanel';
import { VrekoArchitectureTrace } from '@/components/interactions/VrekoArchitectureTrace';
import { vrekoArchitecture } from '@/content/experiments/vreko-architecture';
import {
  ProofAside,
  ProofColumns,
  ProofField,
  ProofList,
  ProofProse,
  ProofSection,
  ProofTags,
} from '@/components/proof/ProofSection';

/**
 * 02 — Vreko.
 *
 * The architecture was a static five-item list until the public repositories were
 * audited. That audit changed the section's argument: none of the three public
 * repositories contain implementation source, and the honest claim is not "here are the
 * layers" but "here is exactly how much of this you can inspect, and here is the
 * command that proves where the line falls". A list cannot make that argument; the
 * semantic zoom can, because the publication state of every node is part of the
 * diagram rather than a footnote under it.
 */
export function VrekoSection() {
  return (
    <ProofSection proof={vreko}>
      <VrekoArchitectureTrace data={vrekoArchitecture} />

      <ProofColumns>
        <ProofProse>
          {vreko.fields.map((field) => (
            <ProofField label={field.label} key={field.label}>
              {field.body}
            </ProofField>
          ))}

          {vreko.technologies ? (
            <ProofTags label="ENGINEERING SURFACE" tags={vreko.technologies} />
          ) : null}

          <ProofList label="WHAT THIS DEMONSTRATES" items={vreko.demonstrates} />
        </ProofProse>

        <ProofAside>
          <EvidencePanel
            status={vreko.status}
            code={vreko.evidenceCode}
            rows={vreko.summary}
            evidence={vreko.evidence}
            boundary={vreko.boundary}
          />
        </ProofAside>
      </ProofColumns>
    </ProofSection>
  );
}
