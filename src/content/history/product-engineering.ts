import type { HistoryEntry, HistoryStage, ProductHistory } from '@/lib/types';

/**
 * The production record the recent agent systems sit on, structured.
 *
 * ## Why this is a content module and not section copy
 *
 * The design direction sets this section as three registers read together: a four-stage
 * progression, who the products served, and the disciplines the work spanned. Written
 * as prose it is one paragraph a reader skims. Written as records it is a thing a
 * reader can check line by line, which is the only reason this site exists.
 *
 * ## The rule that shapes every entry below
 *
 * The direction supplied this section with three details the corpus did not support:
 * named member, broker and employer product surfaces; screens built in the 2016–2019
 * period; a browser stack. All three have since been supplied by the owner and are now
 * stated from `facts.ts`. A design mockup is still not a source; the record is.
 *
 * The arrangement that got the page here is worth keeping even though nothing currently
 * uses it. An entry is either *stated*, carrying a `body` traceable to the fact corpus,
 * or *unresolved*, carrying the thing it would like to say and the id of a recorded gap
 * in `UNVERIFIED`. Deleting an unsupported entry was always the tempting fix and always
 * the worse one: a page that silently drops what it cannot prove reads as complete, and
 * the reader never learns there was a question.
 *
 * `UNVERIFIED` is empty as of this pass, so every entry below is stated. The unresolved
 * path stays wired and stays tested, because the next thing this page cannot prove
 * should render as a question and not as a deletion.
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
    body: "Started in production support on the provider application team, then built provider-facing applications including Contact Preference and Fee Schedule on the team's new React application library, as the estate moved from Java toward JavaScript front ends consuming shared enterprise services.",
  },
  {
    id: 'stage-02',
    roleId: 'systems-analyst',
    ordinal: 'STAGE 02',
    title: 'Technical leadership',
    span: '2019 – 2022',
    body: 'Member-facing portal work hands-on (login and MFA flows, billing transparency, routing, portal architecture) over high-availability microservices, with IAM protocols established alongside security teams using OAuth and SAML.',
  },
  {
    id: 'stage-03',
    roleId: 'devops-strategy',
    ordinal: 'STAGE 03',
    title: 'Engineering strategy',
    span: '2022 – 2023',
    body: 'Championed early Azure DevOps adoption, moving a large shared delivery backlog off IBM RTC, HP ALM and UrbanCode Deploy, with CI/CD frameworks on Azure DevOps and Argo CD and backlog governance held when product ownership capacity was constrained.',
  },
  {
    id: 'stage-04',
    roleId: 'team-lead',
    ordinal: 'STAGE 04',
    title: 'Team leadership',
    span: '2023 – 2026',
    body: 'Led the full-stack Consumer Portals team through a Sitecore-to-Next.js modernization: the member and broker/employer portals, the APIs behind them, and the multi-tenant portal, identity and interoperability requirements Portal Refresh, CIAM and Shared Health added.',
  },
];

/**
 * Who the products served.
 *
 * The direction stated three audiences, members, brokers and employers, each with its
 * own workflows. When this section was first written the corpus named the enterprise
 * initiatives and nothing beneath them, so all three were one open question rendered as
 * a dashed box. The record now establishes the surfaces, what the team owned, and
 * representative capabilities on each.
 *
 * Brokers and employers are one row rather than two. Their experiences ran on
 * substantially shared portal infrastructure under shared organisational ownership, and
 * splitting them would manufacture detail rather than report it. A register that
 * invents separation to look thorough is the same failure as one that invents features.
 *
 * Every row here is *team* ownership and says so. The hands-on rows live in the stage
 * progression above, where they are attached to the years the work was done.
 */
const AUDIENCES: readonly HistoryEntry[] = [
  {
    id: 'audience-provider',
    label: 'Providers',
    body: 'The first surface, early in the career: provider-facing applications including Contact Preference and Fee Schedule, built hands-on.',
  },
  {
    id: 'audience-member',
    label: 'Members',
    body: 'Authenticated portal experiences, login and MFA, billing transparency. Services the team owned supplied claims, ID-card and enrollment information to those portals and to other enterprise consumers.',
  },
  {
    id: 'audience-broker-employer',
    label: 'Brokers and employers',
    body: 'One surface in practice, on shared portal infrastructure the same team owned: authenticated book-of-business visibility and credentialing, multi-tenant by requirement.',
  },
  {
    id: 'audience-enterprise',
    label: 'The enterprise itself',
    body: "Member information assembled from Facets and other enterprise sources flowed back out through the team's services to consumers beyond the portals.",
  },
];

/**
 * The disciplines the work spanned.
 *
 * All stated. The frontend row is the one worth reading twice: "do they do the browser
 * too?" is the first question a product-engineering reader asks, and for one revision
 * of this page the honest answer was the question itself, because the design direction
 * had answered it with a stack no source supported. The record has since supplied one,
 * so the row states it and states nothing beyond it. There is still no GraphQL row, no
 * state-management library and no design system here, for exactly the reason there was
 * no framework row before: nothing establishes them, and the target role listing one of
 * them is not evidence.
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
    body: 'React through Next.js, and Sitecore customer portals: login and MFA flows, billing-transparency experiences, routing and portal architecture, later on a Turborepo and pnpm monorepo.',
  },
  {
    id: 'discipline-backend',
    label: 'Backend / services',
    body: 'Legacy Java systems, the REST-based Node.js microservice modernization behind those surfaces, and the APIs that assembled member information across Facets and other enterprise data sources.',
  },
  {
    id: 'discipline-identity',
    label: 'Identity and multi-tenancy',
    body: 'CIAM, OAuth and SAML, authentication workflows on Ping Security and CyberArk, and the multi-tenant portal and interoperability behaviour Shared Health required so one platform could serve state-specific insurance operations.',
  },
  {
    id: 'discipline-release',
    label: 'Release / production',
    body: 'Azure DevOps, OpenShift, Tekton and Argo CD, moved off IBM RTC, HP ALM and UrbanCode Deploy. Two refinement sessions a week, a Tuesday release train with a hotfix path, and a quarterly burn-down.',
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
