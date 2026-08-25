import { LINEAR_RECEIPTS, LINEAR_RECEIPTS_BOUNDARY } from '../../linear/receipts';
import { PUBLISHED_SITES } from '../../published';
import type { ResumeProjection } from '../projection';

/**
 * The Linear projection.
 *
 * Same corpus, different question. The durable résumé answers "what is this person's
 * record?"; this one answers "can this person build the product surface *and* the agent
 * platform under it?", which changes what deserves the scarce space on two sheets:
 *
 * - The profile leads on products rather than on infrastructure.
 * - The enterprise record leads on the customer-facing initiatives — Portal Refresh,
 *   CIAM, Shared Health — with modernization and DevOps beneath them. Same sentences,
 *   reordered. Nothing here is written for this reader.
 * - Never Ask Twice is promoted out of the ALSO footnote into a full product entry,
 *   because agent memory is the closest of the four to what this reader builds.
 * - Vreko drops to the compact line. It is the strongest MCP artifact in the corpus and
 *   the least differentiating for a company already operating an agent platform.
 * - Agent-platform receipts get a block, because "has used Linear as an execution
 *   control plane" is a fact about this reader's product that no proof section carries.
 * - The stack becomes five grouped capabilities instead of one undifferentiated run.
 * - Certifications and nonprofit leadership are dropped, which is what pays for the
 *   receipts block. They are still facts; they are not the facts this reader needs.
 *
 * What is *not* here is as deliberate. There is no frontend framework, no per-audience
 * product ownership, and nothing about the 2016–2019 period beyond the title held,
 * because this corpus does not establish any of them — see `UNVERIFIED` in `facts.ts`.
 * Those are the three things a Linear-shaped résumé would most like to claim, which is
 * exactly why the absence is recorded rather than quietly filled.
 */
export const linearResumeProjection: ResumeProjection = {
  id: 'linear',
  layout: 'linear',
  domains: 'AI PRODUCTS · AGENT SYSTEMS · FULL-STACK PRODUCT ENGINEERING',

  profile: {
    label: '01 / PROFILE',
    heading: 'I build AI products and the systems that make them reliable in production.',
    body: '8 years building production software inside regulated healthcare — hands-on across services, data, identity, and delivery — and 2.5 years leading the teams doing it. The work spans both halves of a product: the customer-facing platform initiatives and the platform underneath them. Recent independent work is specialised on agentic products and the integration infrastructure they need: persistent agent memory evaluated by ablation, a controlled experiment in agent coordination, and an open standard for repository intelligence. Each ships with the evidence needed to tell whether it works, which is what decides whether an agent product survives production.',
  },

  systems: {
    labelLines: ['03 / SELECTED', 'AI PRODUCTS'],
    note: 'Independent product work · Marcelle Labs',
    entries: [
      // One bullet each. The summary line already carries what each product *is*, so
      // the bullet spends the line on the thing a reader cannot infer from the name.
      { id: 'never-ask-twice', bulletIds: ['never-ask-twice:product'] },
      { id: 'interlock', bulletIds: ['interlock:separation'] },
      // One bullet. The specification is the durable half — a standard someone else can
      // adopt — and the integration story is carried by the proof section on the site.
      { id: 'workspace-json', bulletIds: ['workspace-json:standard'] },
    ],
    compact: { label: 'ALSO', systemId: 'vreko' },
    boundaryLabel: 'BOUNDARY',
    /*
     * No per-system tool chain on this sheet. Block 05 groups the same technologies by
     * capability, which is the form a reader scanning for one competence can actually
     * use, and printing both would spend a fifth of page two saying the same thing
     * twice.
     */
    showStack: false,
  },

  experience: {
    labelLines: ['02 / PRODUCT', 'ENGINEERING'],
    note: 'Customer-facing healthcare platforms · regulated production',
    roles: [
      {
        id: 'team-lead',
        // Customer-facing initiatives first, then the identity work behind them, then
        // the platform record. Durable bullets, promoted — not rewritten.
        bulletIds: [
          'team-lead:initiatives',
          'team-lead:auth',
          'team-lead:ai-engineering',
          'team-lead:modernization',
        ],
      },
      {
        id: 'devops-strategy',
        bulletIds: [
          'devops-strategy:governance',
          'devops-strategy:test-automation',
          'devops-strategy:frameworks',
        ],
      },
      { id: 'systems-analyst' },
      { id: 'developer' },
    ],
  },

  agentPlatform: {
    labelLines: ['04 / AGENT', 'PLATFORM'],
    note: 'Linear as an execution control plane',
    receipts: LINEAR_RECEIPTS,
    boundaryLabel: 'BOUNDARY',
    boundary: LINEAR_RECEIPTS_BOUNDARY,
  },

  foundation: {
    labelLines: ['05 / TECHNICAL', 'FOUNDATION'],
    stack: {
      label: 'CAPABILITIES',
      kind: 'groups',
      groupIds: [
        'product-web',
        'ai-agents',
        'backend-data',
        'platform-delivery',
        'identity-security',
      ],
    },
    educationLabel: 'EDUCATION',
  },

  footerTrailing: 'AI PRODUCTS & AGENT PLATFORM',
  footerLink: {
    label: 'qwynn.marcellelabs.io/linear ↗',
    href: `${PUBLISHED_SITES.personal.replace(/\/$/, '')}/linear`,
  },
};
