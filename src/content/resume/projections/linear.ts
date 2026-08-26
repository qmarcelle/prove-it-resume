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
 * - The enterprise record leads on the customer-facing portals and the team that
 *   delivered them, with the enterprise programmes and the platform modernization
 *   beneath. Same sentences, reordered. Nothing here is written for this reader.
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
 * What is *not* here is as deliberate, and the list is now short. The frontend, the
 * per-audience portals and the 2016–2019 period were all open questions and are all
 * stated facts. What this projection still does not say is GraphQL, a state-management
 * library, a named design system, or any broker capability nobody supplied. GraphQL is
 * the one worth naming: it is on the target role's published stack, and it is absent
 * because no record establishes it rather than because nobody noticed.
 *
 * The other thing it will not do is flatten ownership. Five lines under the lead role
 * describe a portal estate and four of them say whose it was, because the difference
 * between "the team owned" and "built" is the difference between a true sentence and a
 * flattering one. `ownership` in `facts.ts` makes that a field rather than a habit.
 */
export const linearResumeProjection: ResumeProjection = {
  id: 'linear',
  layout: 'linear',
  domains: 'AI PRODUCTS · AGENT SYSTEMS · FULL-STACK PRODUCT ENGINEERING',

  profile: {
    label: '01 / PROFILE',
    heading: 'I build AI products and the systems that make them reliable in production.',
    body: 'Nearly a decade building production software in regulated healthcare, from hands-on application development through technical and engineering leadership. It starts in React, writing provider applications, and ends leading the full-stack team behind the member and broker/employer portal estate: browser, APIs, identity and enterprise data. Recent independent work is specialised on agentic products: agent memory evaluated by ablation, a controlled coordination experiment, and an open standard for repository intelligence, each shipping with the evidence that says whether it works.',
  },

  systems: {
    labelLines: ['03 / SELECTED', 'AI PRODUCTS'],
    note: 'Independent product work · Marcelle Labs',
    entries: [
      // One bullet each. The summary line already carries what each product *is*, so
      // the bullet spends the line on the thing a reader cannot infer from the name.
      { id: 'never-ask-twice', bulletIds: ['never-ask-twice:product'] },
      { id: 'interlock', bulletIds: ['interlock:separation'] },
      // One bullet. The specification is the durable half (a standard someone else can
      // adopt) and the integration story is carried by the proof section on the site.
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
        /*
         * The product surface first, then what stood behind it, then who it served,
         * then the architecture the whole estate had to answer, then the team that
         * delivered it. A reader who stops after two lines still has "full-stack team,
         * portals plus APIs, member and broker/employer", which is the claim.
         */
        bulletIds: [
          'team-lead:portals',
          'team-lead:services',
          'team-lead:brokers',
          'team-lead:shared-health',
          'team-lead:team',
        ],
      },
      // One line. The delivery-modernization record is real and is not what this reader
      // is buying, so it takes the smallest space that still states it.
      { id: 'devops-strategy', bulletIds: ['devops-strategy:azure'] },
      /*
       * The hands-on portal work, then the services under it. This projection's argument
       * is that the product surface was built and not only led, and this is the role
       * where that is true of one pair of hands on both halves of the stack.
       */
      { id: 'systems-analyst', bulletIds: ['systems-analyst:portals'] },
      // Where the hands were before the team was. Contact Preference and Fee Schedule
      // are the two things on this sheet with a single unambiguous author.
      { id: 'developer', bulletIds: ['developer:provider-apps'] },
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
