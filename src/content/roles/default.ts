import type { RoleLens } from '@/lib/types';

/**
 * The durable, organisation-neutral lens served at `/`.
 *
 * The design export defaulted `roleOrg` to "athenahealth / Yoh". That is deliberately
 * not the case here: baking one employer into the root would make a durable artifact
 * look like a single job application, and would go stale the moment that application
 * closes. Organisation-specific framing lives at `/role/<slug>`.
 */
export const defaultRole: RoleLens = {
  slug: 'default',
  roleTitle: 'Staff / Principal · AI Platform & Developer Systems',
  // The design export's own default masthead title. The chip's wording carries the
  // middot and the second noun phrase, which overflow the résumé's single mono line.
  resumeTitle: 'Staff / Principal AI Platform Engineer',
  roleFitHeading: 'What these systems have to do with your problem.',
  proofOrder: ['vreko', 'repository-intelligence', 'interlock'],
  mapping: [
    {
      problem: 'Build MCP servers and tool surfaces',
      evidence: 'Vreko',
      discuss: 'Protocol boundaries, tools, auth, deployment, lifecycle',
    },
    {
      problem: 'Introduce agents into developer workflows',
      evidence: 'Vreko + workspace.json',
      discuss: 'Context surfaces, agent/tool interaction, developer experience',
    },
    {
      problem: 'Integrate with CI/CD',
      evidence: 'Vreko + enterprise platform history',
      discuss: 'Deployment pipelines, automation boundaries, operational feedback',
    },
    {
      problem: 'Build production-grade agent systems',
      evidence: 'Vreko + Interlock',
      discuss: 'State, coordination, failure modes, evidence, observability',
    },
    {
      problem: 'Persist agent state across sessions',
      evidence: 'Never Ask Twice',
      discuss:
        'Memory, retrieval, forgetting policy, checkpointing, ablation-based evaluation',
    },
    {
      problem: 'Integrate agents with enterprise metadata systems',
      evidence: 'Tally + workspace.json',
      discuss:
        'Coordinate resolution, joined evidence, plan comparison, verified writeback',
    },
    {
      problem: 'Improve engineering productivity',
      evidence: 'workspace.json + platform background',
      discuss: 'Measure first, introduce one useful surface, expand based on evidence',
    },
    {
      problem: 'Explain architecture rather than hide behind AI-generated code',
      evidence: 'All three',
      discuss: 'Tradeoffs, negative results, rejected assumptions, limitations',
    },
  ],
  showAvailability: true,
  metaTitle: 'Qwynn Marcelle — Prove It Resume',
  metaDescription:
    'A technical evidence surface for hiring decisions. Three engineering claims about AI platform and developer systems work, with inspectable evidence and stated boundaries.',
  isDefault: true,
};
