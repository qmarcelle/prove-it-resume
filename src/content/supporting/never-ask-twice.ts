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
