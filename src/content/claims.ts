import type { Claim } from '@/lib/types';

/**
 * The Claim Ledger. Collapsed by default and deliberately secondary: it exists so a
 * skeptical evaluator can audit the claims, not so the evidence framework can upstage
 * the person. Every row states its own limit.
 */
export const CLAIMS: readonly Claim[] = [
  {
    id: 'claim-mcp',
    claim: 'Built an MCP-based agent intelligence surface',
    evidence: 'Public Vreko repository',
    boundary: 'Do not infer external adoption without evidence',
  },
  {
    id: 'claim-standard',
    claim: 'Stewards an open repository-intelligence standard',
    evidence: 'workspace.json specification',
    boundary: 'Independent from proprietary Vreko behavior',
  },
  {
    id: 'claim-implementation',
    claim:
      'Implemented the standard for a coding agent and an enterprise metadata system',
    evidence: 'Codex implementation · Tally case',
    boundary: 'Demonstrates the integration path, not adoption or scale',
  },
  {
    id: 'claim-experiments',
    claim: 'Ran controlled coordination experiments',
    evidence: 'Interlock evidence packet',
    boundary: 'Bounded experiment, not universal safety proof',
  },
  {
    id: 'claim-memory',
    claim: 'Evaluated persistent agent memory against re-asking',
    evidence: 'Never Ask Twice ablation',
    boundary: 'Measured inside the described evaluation setup only',
  },
  {
    id: 'claim-career',
    claim: 'Enterprise healthcare engineering background',
    evidence: 'résumé / professional history',
    boundary: 'No confidential employer artifacts',
  },
] as const;
