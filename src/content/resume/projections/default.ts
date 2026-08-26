import { PUBLISHED_SITES } from '../../published';
import { RESUME_EMPLOYER } from '../facts';
import type { ResumeProjection } from '../projection';

/**
 * The durable résumé.
 *
 * This is the document the design export specified, unchanged: the same blocks in the
 * same order, with the same copy. It is a projection like any other; it selects every
 * fact in its durable order and frames nothing for a particular reader, which is what
 * lets it and the Linear projection share one renderer without either becoming a
 * special case inside the other.
 *
 * Changing anything here changes the artifact a hundred processes may already hold, so
 * it does not change without a deliberate global correction. `resume-artifacts.json`
 * fingerprints it; an accidental edit fails `pnpm resume:pdf:check`.
 *
 * It has had exactly one such correction. The profile opened on "8 years in technology":
 * a figure the employment row beneath it contradicts, since the BlueCross tenure
 * alone runs 08/2016 – 03/2026, and now opens on the durable career phrasing in
 * `RESUME_CAREER_DURATION`. The leadership figure went with it: the record now states
 * the team scope in a bullet, which is the concrete version of what "2.5 years leading
 * agile software teams" was gesturing at.
 */
export const defaultResumeProjection: ResumeProjection = {
  id: 'default',
  layout: 'default',
  domains: 'AI PLATFORM · DEVELOPER SYSTEMS · SOFTWARE ARCHITECTURE',

  profile: {
    label: '01 / PROFILE',
    heading: 'I build the infrastructure between AI agents and production software.',
    body: 'Engineering leader with nearly a decade building production software in regulated healthcare, from hands-on application development through technical and engineering leadership. Built customer-facing applications and portal experiences, then led the full-stack team behind a member and broker/employer portal estate: browser, services, identity and enterprise data. Recent independent work builds the layer between coding agents and production systems: MCP and tool surfaces, repository intelligence, and controlled evaluation of whether the resulting system actually works.',
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
    /*
     * Every role, in durable order, and every bullet in durable order within it. What
     * this projection stopped doing is printing *all* of them.
     *
     * That is a real change and worth stating. The corpus used to be small enough that
     * "the neutral résumé selects everything" was both an invariant and a layout that
     * fit; the record has since grown a hands-on 2016–2019 period, a full-stack team
     * ownership line and an enterprise-data line, and two fixed pages cannot absorb
     * unbounded facts. Selecting is what the projection layer is for.
     *
     * The property that actually distinguishes this sheet from a tailored one is
     * preserved and asserted: it reorders nothing. A reader comparing this résumé with
     * the Linear one finds the same sentences in the same sequence, with fewer of them.
     */
    roles: [
      {
        id: 'team-lead',
        bulletIds: [
          'team-lead:portals',
          'team-lead:services',
          'team-lead:team',
          'team-lead:modernization',
        ],
      },
      {
        id: 'devops-strategy',
        bulletIds: ['devops-strategy:azure', 'devops-strategy:governance'],
      },
      { id: 'systems-analyst', bulletIds: ['systems-analyst:portals'] },
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
