import type { HistoryEntry, HistoryStage, ProductHistory } from '@/lib/types';

/**
 * The production record the recent agent systems sit on, structured.
 *
 * ## Why this is a content module and not section copy
 *
 * The design direction sets this section as three registers read together: a four-stage
 * progression, who the products served, and the disciplines the work spanned. Written
 * as prose it is one paragraph a reader skims. Written as records it is a thing a
 * reader can check line by line — which is the only reason this site exists.
 *
 * ## The rule that shapes every entry below
 *
 * The direction supplied this section with details the corpus does not support: named
 * member, broker and employer product surfaces; screens built in the 2016–2019 period;
 * a browser stack. None of that is in `facts.ts`, and a design mockup is not a source.
 *
 * The tempting fix is to delete the unsupported entries, and that is worse than it
 * looks: a page that silently drops what it cannot prove reads as complete, and the
 * reader never learns there was a question. So an entry is either *stated*, carrying a
 * `body` traceable to the fact corpus, or *unresolved*, carrying the thing it would
 * like to say and the id of the recorded gap in `UNVERIFIED`. Unresolved entries render
 * through the same dashed burnt-orange treatment every unverified row on this site gets.
 * They are never styled as evidence.
 *
 * `product-history.test.ts` asserts both halves: that every `unverifiedId` resolves in
 * `UNVERIFIED`, and that every stated entry names a role that exists in the chronology.
 */

/**
 * Four stages, each pinned to a role in `RESUME_ROLES`.
 *
 * `roleId` is what keeps this from becoming a second, drifting chronology. The stage
 * says what the period established; the résumé says what the title and the dates were;
 * and the test asserts the stage names a role the résumé still has.
 */
const STAGES: readonly HistoryStage[] = [
  {
    id: 'stage-01',
    roleId: 'developer',
    ordinal: 'STAGE 01',
    title: 'Hands-on application development',
    span: '2016 – 2019',
    unresolved: {
      wants: 'What was built in this period, beyond the titles held.',
      unverifiedId: 'early-developer-detail',
    },
  },
  {
    id: 'stage-02',
    roleId: 'systems-analyst',
    ordinal: 'STAGE 02',
    title: 'Technical leadership',
    span: '2019 – 2022',
    body: 'High-availability microservice architecture, and IAM protocols established with security teams using OAuth and SAML.',
  },
  {
    id: 'stage-03',
    roleId: 'devops-strategy',
    ordinal: 'STAGE 03',
    title: 'Engineering strategy',
    span: '2022 – 2023',
    body: 'CI/CD frameworks on Azure DevOps and Argo CD, and backlog governance held when product ownership capacity was constrained.',
  },
  {
    id: 'stage-04',
    roleId: 'team-lead',
    ordinal: 'STAGE 04',
    title: 'Team leadership',
    span: '2023 – 2026',
    body: 'Enterprise modernization from legacy Java monoliths to Node.js microservices, DevOps transformation, and alignment of Portal Refresh, CIAM and Shared Health across security, product, middleware and engineering teams.',
  },
];

/**
 * Who the products served.
 *
 * The direction states three audiences — members, brokers, employers — each with its
 * own workflows. That is a specific and checkable claim about product ownership, and
 * the corpus does not contain it: it names the initiatives and nothing beneath them. So
 * the register is kept, because a reader evaluating product engineering is right to ask
 * it, and the answer is the recorded gap rather than the direction's copy.
 */
const AUDIENCES: readonly HistoryEntry[] = [
  {
    id: 'audience-initiatives',
    label: 'Named initiatives',
    body: 'Portal Refresh, CIAM and Shared Health — enterprise programmes led or aligned across security, product, middleware and engineering.',
  },
  {
    id: 'audience-surfaces',
    label: 'Per-audience surfaces',
    unresolved: {
      wants:
        'Ownership of distinct member, broker and employer product surfaces beneath those initiatives.',
      unverifiedId: 'member-broker-employer-products',
    },
  },
];

/**
 * The disciplines the work spanned.
 *
 * Five stated, one unresolved. The unresolved one is the frontend, and it is the entry
 * this whole treatment exists for: "do they do the browser too?" is the first question
 * a product-engineering reader asks, the direction answered it with a stack, and no
 * source supplied to this repository names one. React, Angular and Vue are all equally
 * unsupported here, so the honest answer is the question itself.
 */
const DISCIPLINES: readonly HistoryEntry[] = [
  {
    id: 'discipline-product',
    label: 'Product delivery',
    body: 'Customer-facing platform initiatives carried across teams, in a domain where a wrong screen is a wrong benefit.',
  },
  {
    id: 'discipline-frontend',
    label: 'Browser / frontend',
    unresolved: {
      wants:
        'Which frontend framework, if any, these surfaces were built in — and browser-side ownership of them.',
      unverifiedId: 'frontend-framework',
    },
  },
  {
    id: 'discipline-backend',
    label: 'Backend / services',
    body: 'Legacy Java systems, and the REST-based Node.js microservice modernization behind those surfaces.',
  },
  {
    id: 'discipline-identity',
    label: 'Identity / security',
    body: 'IAM, OAuth and SAML, and authentication workflows optimised with Ping Security and CyberArk.',
  },
  {
    id: 'discipline-release',
    label: 'Release / production',
    body: 'Azure DevOps, OpenShift, Tekton and Argo CD — standardised CI/CD and shortened release cycles.',
  },
  {
    id: 'discipline-regulated',
    label: 'Regulated environment',
    body: 'Nearly a decade of production work inside regulated healthcare, where compliance is a condition of shipping rather than a phase of it.',
  },
];

export const PRODUCT_ENGINEERING_HISTORY: ProductHistory = {
  stages: STAGES,
  audiencesHeading: 'WHO THE PRODUCTS SERVED',
  audiences: AUDIENCES,
  disciplinesHeading: 'WHAT THE WORK SPANNED',
  disciplines: DISCIPLINES,
};
