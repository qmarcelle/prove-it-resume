import { PUBLISHED_SITES } from '../../published';
import type { ResumeProjection } from '../projection';

/**
 * The Product Engineer role-family projection.
 *
 * Same corpus, one question: has this person personally shipped customer-facing software
 * across the stack, and made product decisions while doing it? That changes what deserves
 * the scarce space:
 *
 * - The record leads on the portals, then on the hands-on work inside them. A product
 *   engineering reader discounts a headcount and looks for code, so the team-size bullet
 *   is not selected here. The lead title and the first bullet still say a team was led.
 * - PostHog leads page two because it is the one artifact a reader can open and read the
 *   review history of. Its bullets carry their own provenance limits.
 * - DataHub, Buildomator and Marcelle Labs are separate entries because they are separate
 *   kinds of evidence: a merged upstream change, maintainer collaboration, and client
 *   delivery. Each states what it does not establish.
 * - Vreko, Never Ask Twice and the workspace.json entry are not selected, and neither are
 *   Agile certifications or nonprofit leadership. That pays for the external work. The
 *   workspace.json falsification story and the Tally integration stay in the interview
 *   bank, so the Tally work cannot be read as the merged DataHub contribution.
 *
 * It names no company, so it stays reusable across Product Engineer applications. It
 * reuses the composition `LinearResumeLayout` already provides, with no agent-platform
 * block: experience on page one, products and capabilities on page two.
 */
export const productEngineerResumeProjection: ResumeProjection = {
  id: 'product-engineer',
  layout: 'linear',
  revision: 'REV 2026.11',
  omitBoundaries: true,
  domains: 'TYPESCRIPT / REACT / NODE · PRODUCT OWNERSHIP · DEVELOPER LEVERAGE',

  profile: {
    label: '01 / PROFILE',
    heading:
      'I build customer-facing products end to end, and the building blocks that make the next one cheaper.',
    body: 'Nearly a decade building production software in regulated healthcare, from hands-on application development through technical and engineering leadership. I began in production support, built React provider applications and member login, MFA and billing experiences hands-on, then led the full-stack team behind the member and broker/employer portals. Beyond BCBST, I have shipped customer-facing websites through Marcelle Labs, contributed upstream changes to PostHog and the DataHub MCP server, and developed AI-assisted engineering workflows that add leverage while I keep architectural judgment and verification responsibility.',
  },

  experience: {
    labelLines: ['02 / PRODUCT', 'ENGINEERING'],
    note: 'Customer-facing healthcare platforms · regulated production',
    highlightIds: ['employer:modernization', 'employer:substrate', 'employer:storybook'],
    roles: [
      {
        id: 'team-lead',
        bulletIds: [
          'team-lead:portals-ownership',
          'team-lead:services',
          'team-lead:brokers',
        ],
      },
      { id: 'devops-strategy', bulletIds: ['devops-strategy:frameworks'] },
      { id: 'systems-analyst', bulletIds: ['systems-analyst:portals'] },
      { id: 'developer', bulletIds: ['developer:provider-apps'] },
    ],
  },

  systems: {
    labelLines: ['03 / EXTERNAL', 'WORK'],
    note: 'Upstream contributions, maintainer collaboration and client delivery',
    entries: [
      { id: 'posthog', bulletIds: ['posthog:outcome', 'posthog:abstraction'] },
      'datahub-mcp',
      'buildomator',
      'marcelle-labs-delivery',
    ],
    boundaryLabel: 'BOUNDARY',
    // Block 04 groups the same technologies by capability.
    showStack: false,
  },

  foundation: {
    labelLines: ['04 / TECHNICAL', 'FOUNDATION'],
    stack: {
      label: 'CAPABILITIES',
      kind: 'groups',
      groupIds: [
        'product-full-stack',
        'testing',
        'backend-data',
        'platform-delivery',
        'identity-security',
      ],
    },
    educationLabel: 'EDUCATION',
  },

  footerTrailing: '',
  footerLead: 'PORTFOLIO:',
  footerLink: { label: 'qwynn.marcellelabs.io', href: PUBLISHED_SITES.personal },
};
