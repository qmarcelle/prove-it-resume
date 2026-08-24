import { vreko } from '@/content/proofs';
import { EvidencePanel } from '@/components/evidence/EvidencePanel';
import { ArchitectureStrip } from '@/components/proof/ArchitectureStrip';
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
 * The architecture is presented as a semantic list rather than an animation. The claim
 * is "these are the layers and this is their order", and an ordered list states that
 * exactly, works in every assistive technology, and costs nothing. A "trace a request"
 * enhancement can be added later if it would explain something the list cannot.
 */
const VREKO_ARCHITECTURE = [
  'CODING AGENT',
  'MCP TRANSPORT',
  'TOOL CONTRACT',
  'SESSION / CONTEXT',
  'INTELLIGENCE',
] as const;

export function VrekoSection() {
  return (
    <ProofSection proof={vreko}>
      <ProofColumns>
        <ProofProse>
          {vreko.fields.map((field) => (
            <ProofField label={field.label} key={field.label}>
              {field.body}
            </ProofField>
          ))}

          <ArchitectureStrip
            label="ARCHITECTURE"
            nodes={VREKO_ARCHITECTURE}
            orientation="vertical"
          />

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
