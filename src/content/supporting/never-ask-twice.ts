import type { SupportingWork } from '@/lib/types';

export const neverAskTwice: SupportingWork = {
  id: 'never-ask-twice',
  title: 'Never Ask Twice',
  question: 'Can persistent agent memory reduce unnecessary re-asking?',
  summary:
    'An enterprise support MemoryAgent that carries customer context across sessions, evaluated with a live re-ask-rate ablation.',
  tags: ['AGENT MEMORY', 'RETRIEVAL', 'EVALUATION', 'ABLATION'],
  surface: 'forgetting policy · MCP · pgvector / Postgres · TypeScript · cloud execution',
  boundary:
    'The ablation runs against fixed synthetic fixtures and a stubbed model client so that scoring is deterministic. It is measured within that setup and is not a general claim about memory in other products, or about behaviour under real traffic.',
  /*
   * How this names itself in the Evidence Index of a surface that promotes it.
   *
   * Both lines are compressions of the record above rather than additions to it: the
   * summary restates `question`, and `MEASURED BY ABLATION` is the same statement the
   * summary, the tags and the claim ledger already make. The tone is `controlled` for
   * the reason the boundary gives: fixed fixtures, a stubbed client, deterministic
   * scoring, which is the same category Interlock is in, not a stronger one.
   */
  listing: {
    summary: 'Agent memory, measured against re-asking',
    status: { label: 'MEASURED BY ABLATION', tone: 'controlled' },
  },
  // In the export this pointed at the general GitHub profile, which is not the
  // ablation. It now points at the evaluation document, which states the three
  // properties the harness checks and the exact command that reproduces them.
  evidence: {
    id: 'nat-proof',
    kind: 'experiment',
    title: 'Never Ask Twice ablation',
    href: 'https://github.com/Marcelle-Labs/never-ask-twice/blob/main/docs/evaluation.md',
    verified: true,
  },
};
