import { PUBLISHED_SITES } from '../../published';
import { RESUME_EMPLOYER } from '../facts';
import type { ResumeProjection } from '../projection';

/**
 * The durable résumé.
 *
 * This is the document the design export specified, unchanged: the same blocks in the
 * same order, with the same copy. It is a projection like any other — it selects every
 * fact in its durable order and frames nothing for a particular reader — which is what
 * lets it and the Linear projection share one renderer without either becoming a
 * special case inside the other.
 *
 * Changing anything here changes the artifact a hundred processes may already hold, so
 * it does not change without a deliberate global correction. `resume-artifacts.json`
 * fingerprints it; an accidental edit fails `pnpm resume:pdf:check`.
 */
export const defaultResumeProjection: ResumeProjection = {
  id: 'default',
  layout: 'default',
  domains: 'AI PLATFORM · DEVELOPER SYSTEMS · SOFTWARE ARCHITECTURE',

  profile: {
    label: '01 / PROFILE',
    heading: 'I build the infrastructure between AI agents and production software.',
    body: 'Engineering leader with 8 years in technology and 2.5 years leading agile software teams. Modernized legacy platforms into scalable, resilient architectures using Node.js, REST APIs, microservices, cloud-native delivery, CI/CD, and identity and access management. Recent independent work builds the layer between coding agents and production systems: MCP and tool surfaces, repository intelligence, and controlled evaluation of whether the resulting system actually works. Cross-functional leadership across engineering, product, security, middleware, and operations.',
  },

  systems: {
    labelLines: ['02 / SELECTED', 'SYSTEMS'],
    note: 'Independent systems work · Marcelle Labs',
    entries: ['vreko', 'workspace-json', 'interlock'],
    compact: { label: 'ALSO', systemId: 'never-ask-twice' },
    boundaryLabel: 'BOUNDARY',
  },

  experience: {
    labelLines: ['03 / ENTERPRISE', 'EXPERIENCE'],
    note: RESUME_EMPLOYER.note,
    roles: [
      { id: 'team-lead' },
      { id: 'devops-strategy' },
      { id: 'systems-analyst' },
      { id: 'developer' },
    ],
  },

  foundation: {
    labelLines: ['04 / FOUNDATION'],
    stack: { label: 'TECHNICAL STACK', kind: 'line' },
    educationLabel: 'EDUCATION',
    certificationsLabel: 'CERTIFICATIONS',
    nonprofitLabel: 'NONPROFIT LEADERSHIP',
  },

  footerTrailing: 'AI PLATFORM & DEVELOPER SYSTEMS',
  footerLink: { label: 'qwynn.marcellelabs.io ↗', href: PUBLISHED_SITES.personal },
};
