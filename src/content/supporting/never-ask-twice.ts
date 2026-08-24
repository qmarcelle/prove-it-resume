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
    'Ablation measured within the described evaluation setup. Not a general claim about memory in other products.',
  evidence: {
    id: 'nat-proof',
    kind: 'experiment',
    title: 'Never Ask Twice ablation',
    // In the export this pointed at the general GitHub profile, which is not the
    // ablation. Unresolved until the exact artifact is supplied.
    verified: false,
  },
};
