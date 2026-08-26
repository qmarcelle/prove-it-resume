import { CONTACT } from '../site';
import { PUBLISHED_SITES } from '../published';

/**
 * The durable résumé fact corpus.
 *
 * This module holds what is *true*: identity, employment chronology, the systems that
 * exist, the capabilities that are supported by that work, and the credentials. It
 * holds no opinion about what a given reader should see first, how long the profile
 * paragraph should be, or which of these facts deserve the scarce space on a two-page
 * sheet. Those are projection decisions and live in `projections/`.
 *
 * Splitting them is what makes a role-specific résumé safe. A projection selects and
 * orders facts by id; it cannot author a bullet, because there is no field for one.
 * `resume.test.ts` asserts that every string a projection renders exists verbatim here.
 *
 * Copy in this file was ported from the Claude Design export
 * `Prove It Resume - PDF.dc.html` and from the record it was built against. Nothing has
 * been strengthened, rounded, or inferred; see `UNVERIFIED` at the foot of the file for
 * the facts a projection would like to have and must not claim.
 */

/**
 * Who did the thing a bullet describes.
 *
 * This is the field that keeps a leadership résumé honest. The same career contains
 * applications one person wrote and a portal estate a team of fourteen delivered, and
 * on a two-page sheet those two shapes of fact sit three lines apart in the same
 * typeface. Nothing in the copy stops the second from being read as the first, and the
 * reader has no way to tell.
 *
 * So ownership is a field rather than a habit of phrasing, and `resume.test.ts` holds
 * the phrasing to it: a `team` bullet has to attribute to the team in its own words and
 * may not open on a personal authorship verb. A projection can still reorder and select;
 * it cannot promote team work into personal work, because it would have to rewrite a
 * durable string to do it, and there is no field for that.
 */
export type BulletOwnership =
  /** Work this person did with their own hands. */
  | 'personal'
  /** What a team owned or delivered. True of the team, not of one engineer. */
  | 'team'
  /** Organisational or programme scope: who was led, what was aligned, what changed. */
  | 'leadership';

/** A bullet, addressable so a projection can select and order without copying text. */
export type ResumeBullet = {
  id: string;
  text: string;
  ownership: BulletOwnership;
};

export type ResumeSystemFact = {
  id: string;
  name: string;
  /** Renders the name in the mono face, for file-shaped names like `workspace.json`. */
  nameIsCode?: boolean;
  summary: string;
  bullets: readonly ResumeBullet[];
  /** Tool chain, rendered as a single mono line under the bullets. */
  stack: string;
  /** The published site this system can be checked against. */
  verifyHref: string;
  /**
   * The same system in one sentence, for a projection that can afford a footnote and
   * not an article. Durable copy, so the compact form cannot drift from the full one.
   */
  compact?: string;
};

export type ResumeRoleFact = {
  id: string;
  title: string;
  dates: string;
  bullets: readonly ResumeBullet[];
};

/** One row of the grouped technical foundation. */
export type CapabilityGroupFact = {
  id: string;
  label: string;
  items: string;
};

export const RESUME_IDENTITY = {
  name: 'QWYNN MARCELLE',
  revision: 'REV 2026.08',
  /**
   * Sheets in the rendered document. Stated here so the résumé call to action can say
   * how long it is without a second copy of the number living in the CTA; every
   * projection is two explicit page boxes and `resume.spec.ts` asserts exactly that
   * count, so the two cannot drift apart silently.
   */
  pages: 2,
  location: 'Ooltewah, Tennessee',
  /*
   * Ordered by how a reader is most likely to act on them: reply, check the profile,
   * read the code.
   *
   * The personal site is deliberately not here, although it was. Two reasons, and the
   * second is the real one. It already sits in the page-two footer, so the masthead
   * copy was a duplicate, and `qwynn.marcellelabs.io` set beside
   * `qwynn@marcellelabs.io` differs by one character, so a reader scanning the row
   * reads the same address twice and wonders which is wrong. Three entries plus the
   * location also fit on one line, which the fixed-height page prefers.
   *
   * `resume.spec.ts` holds this row to a single line, so a fourth entry fails as a test
   * rather than as content clipped off the bottom of the sheet.
   */
  links: [
    { label: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { label: CONTACT.linkedinLabel, href: CONTACT.linkedin },
    { label: 'github.com/qmarcelle', href: 'https://github.com/qmarcelle' },
  ],
} as const;

export const RESUME_EMPLOYER = {
  name: 'BlueCross BlueShield of Tennessee',
  span: '2016 – 2026',
  location: 'Chattanooga, TN',
  note: 'Regulated healthcare production environments',
} as const;

/**
 * Employment chronology, most recent first.
 *
 * Bullets carry ids because a projection reorders them: the neutral résumé opens the
 * lead role on the customer-facing portals, and a platform-oriented projection can open
 * it on the modernization instead. Same sentences, different first line.
 *
 * ## The shape this chronology has to keep straight
 *
 * One career, four kinds of fact, and they are easy to blur. This person wrote provider
 * applications in 2016 and led a fourteen-person team delivering a portal estate in
 * 2024, and a résumé that renders both in the same voice invites the reader to credit
 * the second to one pair of hands. Every bullet therefore declares its `ownership`, and
 * a `team` bullet has to say so in its own words.
 *
 * The progression is itself the evidence and is deliberately not collapsed. Hands-on
 * developer from 08/2016, technical lead from 08/2019, engineering and delivery
 * strategy from 08/2022, formal people management from 10/2023. "Leadership since 2019"
 * would be shorter and would erase the part a reader actually wants, which is that the
 * leadership grew out of the building rather than replacing it.
 */
export const RESUME_ROLES: readonly ResumeRoleFact[] = [
  {
    id: 'team-lead',
    title: 'Engineering Team Lead',
    dates: '10/2023 – 03/2026',
    bullets: [
      {
        id: 'team-lead:portals',
        ownership: 'team',
        text: 'Led the full-stack Consumer Portals team, which owned the member and broker/employer portals and the APIs behind them, through a Sitecore-to-Next.js modernization.',
      },
      {
        id: 'team-lead:services',
        ownership: 'team',
        text: 'Services the team owned supplied claims, ID-card and enrollment information to those portals and to other enterprise consumers, joining Facets with other enterprise sources.',
      },
      {
        id: 'team-lead:brokers',
        ownership: 'team',
        text: 'Broker and employer experiences the team owned ran on the same portal infrastructure: authenticated book-of-business visibility and credentialing, multi-tenant by requirement.',
      },
      {
        id: 'team-lead:shared-health',
        ownership: 'leadership',
        text: 'Aligned Portal Refresh, CIAM and Shared Health across security, product and middleware, carrying the multi-tenant portal, identity and interoperability requirements they added.',
      },
      {
        id: 'team-lead:team',
        ownership: 'leadership',
        text: 'Led a 14-person engineering team and coordinated an additional 10 contractors on those customer-facing surfaces.',
      },
      {
        id: 'team-lead:modernization',
        ownership: 'leadership',
        text: 'Led enterprise modernization from legacy Java monoliths to REST-based Node.js microservices, and a DevOps transformation on Azure DevOps, OpenShift and Tekton that standardized CI/CD.',
      },
      {
        id: 'team-lead:ai-engineering',
        ownership: 'leadership',
        text: 'Championed AI-assisted engineering and test automation with Cursor AI, Playwright and Cypress, within corporate AI constraints.',
      },
    ],
  },
  {
    id: 'devops-strategy',
    title: 'Engineering & DevOps Strategy Lead',
    dates: '08/2022 – 10/2023',
    bullets: [
      {
        id: 'devops-strategy:azure',
        ownership: 'leadership',
        text: 'Championed early Azure DevOps adoption, moving a large shared delivery backlog off IBM RTC, HP ALM and UrbanCode Deploy, and set usable standards for the wider enterprise rollout.',
      },
      {
        id: 'devops-strategy:frameworks',
        ownership: 'personal',
        text: 'Developed CI/CD frameworks with Azure DevOps and Argo CD for scalable, secure application deployments.',
      },
      {
        id: 'devops-strategy:governance',
        ownership: 'leadership',
        text: 'Established backlog governance and prioritized mission-critical work when product ownership capacity was constrained, preventing uncontrolled scope growth.',
      },
      {
        id: 'devops-strategy:test-automation',
        ownership: 'leadership',
        text: 'Introduced AI-assisted test automation to accelerate release cycles and reduce QA bottlenecks.',
      },
    ],
  },
  {
    id: 'systems-analyst',
    title: 'Application Systems Analyst Specialist / Technical Lead',
    dates: '08/2019 – 08/2022',
    bullets: [
      {
        id: 'systems-analyst:portals',
        ownership: 'personal',
        text: 'Built member-facing portal experiences hands-on: login and MFA flows, billing transparency, routing, portal architecture, and IAM on OAuth and SAML with security teams.',
      },
      {
        id: 'systems-analyst:microservices',
        ownership: 'personal',
        text: 'Architected high-availability microservices to improve reliability and application performance.',
      },
    ],
  },
  {
    id: 'developer',
    title: 'Application Developer / Analyst · Application Developer',
    dates: '08/2016 – 08/2019',
    bullets: [
      {
        id: 'developer:provider-apps',
        ownership: 'personal',
        text: "Built provider-facing applications including Contact Preference and Fee Schedule on the team's new React application library, after starting in production support.",
      },
      {
        id: 'developer:services',
        ownership: 'team',
        text: "Part of the team's move from a Java application estate toward JavaScript front ends consuming shared enterprise services, under the enterprise separation-of-duties model.",
      },
    ],
  },
];

/**
 * How the team ran, as durable fact rather than as résumé copy.
 *
 * Two refinement sessions a week and a Tuesday release train are strong evidence of
 * operating rigour and weak use of a line on a two-page sheet, where they would displace
 * what the team actually built. So they are recorded here, printed on the `/linear`
 * product history where there is room for them, and left out of both résumés.
 *
 * They are here rather than in a notebook because the alternative is a projection
 * inventing them later from memory, which is the failure this corpus exists to prevent.
 */
export const RESUME_DELIVERY_CADENCE = {
  id: 'delivery-cadence',
  refinement: 'Two refinement sessions a week',
  release: 'Weekly planning with a Tuesday release train and a hotfix path',
  roadmap: 'Quarterly roadmap and burn-down',
} as const;

/**
 * The systems, as durable facts.
 *
 * Every bullet here is `personal`, and that is the fact rather than a default: these are
 * independent projects with one author, which is exactly what makes them different in
 * kind from the portal estate a team of fourteen delivered. The field says so instead of
 * leaving a reader to infer it from context.
 *
 * Never Ask Twice is a full entry here rather than a footnote. It always *was* a
 * system; the neutral résumé renders it compactly because that sheet spends its space
 * on the three primary claims, and `compact` exists so that short form is the same
 * fact rather than a second, driftable one.
 */
export const RESUME_SYSTEMS: readonly ResumeSystemFact[] = [
  {
    id: 'vreko',
    name: 'Vreko',
    summary: 'MCP and codebase intelligence for agentic development',
    bullets: [
      {
        id: 'vreko:surface',
        ownership: 'personal',
        text: 'MCP-based intelligence surface exposing repository and session context to compatible AI assistants; transport, protocol surface, and intelligence layer held separate.',
      },
      {
        id: 'vreko:lifecycle',
        ownership: 'personal',
        text: 'Agent lifecycle of brief → pulse → learn → end across local and hosted execution paths, each with its own authentication and deployment boundary.',
      },
    ],
    stack:
      'MCP · JSON-RPC · TypeScript · Node · authentication · tool contracts · cloud deployment · CI/CD',
    verifyHref: PUBLISHED_SITES.vreko,
  },
  {
    id: 'workspace-json',
    name: 'workspace.json',
    nameIsCode: true,
    summary: 'Open standard for repository-derived intelligence',
    bullets: [
      {
        id: 'workspace-json:standard',
        ownership: 'personal',
        text: 'Designed and steward an Apache-2.0 specification (schema, producer tooling, governance) for committing repository intelligence in a deterministic, tool-consumable form.',
      },
      {
        id: 'workspace-json:integration',
        ownership: 'personal',
        text: 'Implemented it for Codex through hooks and MCP, then integrated it with DataHub in Tally: resolved the dbt-to-git path mismatch where the naive join silently returns zero, and checked writeback independently of the API response.',
      },
    ],
    stack:
      'JSON Schema · governance · Codex · MCP · dbt / DataHub · co-change & fragility signals · paired plan comparison',
    verifyHref: PUBLISHED_SITES.workspaceJson,
  },
  {
    id: 'interlock',
    name: 'Interlock',
    summary: 'Controlled evaluation of agent coordination',
    bullets: [
      {
        id: 'interlock:paired-arm',
        ownership: 'personal',
        text: 'Paired-arm experiment on shared-state mutation: two locally valid intents produce an invalid joint outcome; an evidence-bound withhold-and-serialize decision keeps joint state inside the bounded constraint.',
      },
      {
        id: 'interlock:separation',
        ownership: 'personal',
        text: 'Execution separated from observation: frozen evidence packet, independent verifier, explicitly stated non-claims.',
      },
    ],
    stack: 'Google ADK · Vertex AI · Cloud Run · MCP proxy · counterfactual evaluation',
    verifyHref: PUBLISHED_SITES.interlock,
  },
  {
    id: 'never-ask-twice',
    name: 'Never Ask Twice',
    summary: 'Persistent agent memory, evaluated by ablation',
    bullets: [
      {
        id: 'never-ask-twice:product',
        ownership: 'personal',
        text: 'Enterprise support MemoryAgent that carries customer context across sessions, with an explicit forgetting policy rather than unbounded accumulation.',
      },
      {
        id: 'never-ask-twice:ablation',
        ownership: 'personal',
        text: 'Evaluated by a re-ask-rate ablation against fixed fixtures and a stubbed model client, so the score is deterministic and the memory layer is the only thing varying.',
      },
    ],
    stack: 'Agent memory · pgvector / Postgres · MCP · TypeScript · cloud execution',
    verifyHref:
      'https://github.com/Marcelle-Labs/never-ask-twice/blob/main/docs/evaluation.md',
    /*
     * Starts on its own noun rather than on a leader glyph. It used to open with an em
     * dash, which put the separator inside the fact: the string could not be read on
     * its own, and the punctuation was doing layout work that belongs to the component
     * rendering it. `ResumeCompactEntry` sets the name in bold and this follows it.
     */
    compact:
      'Enterprise support MemoryAgent carrying customer context across sessions, evaluated with a live re-ask-rate ablation. Agent memory · pgvector / Postgres · MCP · TypeScript.',
  },
];

/**
 * The boundary carried on every projection's systems block. One sentence, durable,
 * never softened for an audience.
 */
export const RESUME_SYSTEMS_BOUNDARY =
  'Public source and recorded evidence establish that these systems exist and what was observed; they do not establish adoption or production scale outside the repositories where they have been applied.';

/**
 * The boundary carried on the employment record.
 *
 * Durable, and stated in the same voice as every other boundary here: what the
 * chronology establishes, and what a reader should not read into it. It is the prose
 * half of the `ownership` field. The field stops a projection from promoting team work
 * into personal work; this sentence tells the reader that the distinction was drawn on
 * purpose, so "led the full-stack Consumer Portals team" is not read as one engineer
 * building three portals alone.
 */
export const RESUME_EXPERIENCE_BOUNDARY =
  'Titles, dates and scope are stated as held. Lines describing the Consumer Portals estate are what a team owned and delivered, not features authored by one engineer; the named initiatives are enterprise programmes this role led or aligned across security, product and middleware. Hands-on work is stated as hands-on where it was. No proprietary metrics are stated.';

/**
 * How long the career is, in the only form the record supports.
 *
 * This block exists because the figure that used to sit here was wrong in a way a test
 * could not see. The corpus stated "8 years in technology"; the employment row beneath
 * it reads 2016 – 2026, and the BlueCross tenure alone runs 08/2016 – 03/2026:
 * approximately nine years and eight months. A reader doing the arithmetic the rest of
 * this artifact invites them to do finds the contradiction on page one.
 *
 * The replacement is deliberately not a decimal. "9.7 years" would be precise about
 * something that keeps moving and would invite exactly the same arithmetic; a phrase
 * that rounds *down* to a decade cannot be read as a stronger claim than the dates
 * support. It is also the phrasing the site already uses in `CAREER` and in the product
 * history, so there is one career-duration sentence in the repository rather than three.
 *
 * `resume.test.ts` requires any projection that talks about career duration to use this
 * phrase, and fails on the retired figure outright.
 */
export const RESUME_CAREER_DURATION = {
  /** The claim, at the length most projections need. */
  claim: 'nearly a decade building production software in regulated healthcare',
  /** The same claim where the leadership progression is the point. */
  extended:
    'nearly a decade building production software in regulated healthcare, from hands-on application development through technical and engineering leadership',
  /**
   * The figures it must never become again, in any spelling. The digit form sat in the
   * résumé profile and the spelled-out form in the `/linear` hero, which is how a
   * retired claim survives a search for the numeral.
   */
  retired: ['8 years in technology', 'Eight years in technology'],
  basis:
    'BlueCross BlueShield of Tennessee, 08/2016 – 03/2026, in RESUME_ROLES and RESUME_EMPLOYER: approximately nine years and eight months. Professional technology work before that employer is not established here, so nothing longer is claimed.',
} as const;

/**
 * Every quantity any projection is permitted to state, **and what it counts**.
 *
 * A projection may reframe. What it must never do is strengthen a number, and prose is
 * where that happens invisibly. This list used to hold bare numerals, and the test
 * checked only that a numeral appearing in framing copy was one of them, which is half
 * a guard, because it says nothing about the noun the number is attached to.
 *
 * The half it missed shipped. The durable line was "8 years **in technology**"; the
 * Linear projection restated it as "8 years building production software **inside
 * regulated healthcare**" and set it a few lines above an employer row reading
 * 2016 – 2026. The numeral was permitted, so the test passed. The claim was not the
 * same claim: it moved a career-long figure onto one employer's dated span. That figure
 * is now retired outright (see `RESUME_CAREER_DURATION`) but the mechanism it exposed
 * is what this list is shaped by.
 *
 * So a quantity is a *phrase*, and `resume.test.ts` requires every numeral a projection
 * prints (in framing copy and in the bullets it selects) to occur inside one of them.
 * Re-attaching a number to a different subject is a test failure, not an edit nobody
 * reviews.
 */
export type QuantityFact = {
  /** The numeral as written. */
  value: string;
  /** The exact phrase this numeral is permitted to appear inside. */
  claim: string;
  /** What establishes it, for whoever next wants to change the wording. */
  basis: string;
};

export const RESUME_QUANTITIES: readonly QuantityFact[] = [
  {
    value: '2.5',
    claim: '2.5 years leading agile software teams',
    basis:
      'Engineering Team Lead, 10/2023 – 03/2026, in RESUME_ROLES. The formal people-management era only. Technical leadership began 08/2019 and engineering strategy leadership 08/2022; this figure counts neither, and must not be restated as "2.5 years of leadership".',
  },
  {
    value: '14',
    claim: '14-person engineering team',
    basis:
      'Thirteen engineers and one Scrum Master, directly in the team led from 10/2023. It counts the direct team and nothing else.',
  },
  {
    value: '10',
    claim: 'an additional 10 contractors',
    basis:
      'Ten contractors participating in the same delivery system, coordinated rather than managed. Deliberately additive to the 14 and never merged with it: the corpus does not establish 24 direct reports and no projection may imply one.',
  },
  {
    value: '2.0',
    claim: 'Apache-2.0 specification',
    basis:
      'The licence workspace.json is published under. A licence identifier rather than a measurement, listed here so the numeral check does not have to carry an exception.',
  },
];

/** The neutral stack line: one undifferentiated run, as the design export had it. */
export const RESUME_STACK_LINE =
  'Node.js · TypeScript · React / Next.js · Sitecore · Java · REST & microservices · multi-tenant architecture · MCP · JSON Schema · Azure DevOps · Tekton · Argo CD · OpenShift / Kubernetes · CI/CD · CIAM · OAuth · SAML · IAM (Ping, CyberArk) · Playwright · Cypress · SQL (ANSI) · Facets · GitHub · Google Cloud (ADK, Vertex AI, Cloud Run) · Postgres / pgvector · Agile & Scrum';

/**
 * The same capabilities, grouped.
 *
 * A grouping is a projection decision about legibility, but the *membership* is a fact:
 * every item below also appears in `RESUME_STACK_LINE`, in a system's `stack`, or in a
 * role bullet, and `resume.test.ts` enforces that. React, Next.js, Sitecore and Facets
 * are here because the employment record now carries them; GraphQL, Redux and Angular
 * are not, because it does not. GraphQL in particular is on the target role's stack and
 * still absent, which is the whole point of having this rule rather than a preference.
 *
 * IBM RTC, HP ALM and UrbanCode Deploy are named in the delivery-strategy bullet and
 * deliberately not here. They are what the work migrated *away* from, and a capability
 * row reads as a competence offered rather than as a system retired.
 */
export const RESUME_CAPABILITY_GROUPS: readonly CapabilityGroupFact[] = [
  {
    id: 'product-web',
    label: 'PRODUCT / WEB',
    items:
      'TypeScript · React / Next.js · Sitecore · Node.js · REST APIs · Playwright · Cypress',
  },
  {
    id: 'backend-data',
    label: 'BACKEND / DATA',
    items: 'Java · microservices · SQL · Facets · JSON Schema · Postgres / pgvector',
  },
  {
    id: 'ai-agents',
    label: 'AI / AGENTS',
    items: 'MCP · JSON-RPC · tool contracts · Google ADK · Vertex AI',
  },
  {
    id: 'platform-delivery',
    label: 'PLATFORM / DELIVERY',
    items: 'Azure DevOps · Tekton · Argo CD · OpenShift · Cloud Run',
  },
  {
    id: 'identity-security',
    label: 'IDENTITY / SECURITY',
    items: 'CIAM · OAuth · SAML · IAM (Ping, CyberArk) · multi-tenant architecture',
  },
];

export const RESUME_EDUCATION = [
  {
    id: 'masters',
    degree: "Master's Degree, Organizational Leadership",
    institution: "Saint Joseph's University",
    dates: '2019 – 2024',
  },
  {
    id: 'bachelors',
    degree: 'Bachelor of Science, Computer Science',
    institution: 'Southern Adventist University',
    dates: '2009 – 2015',
  },
] as const;

export const RESUME_CERTIFICATIONS = {
  primary:
    'Professional Agile Leadership I (PAL I) · Professional Scrum Master I (PSM I)',
  earlier: '· earlier: SQL (ANSI) Fundamentals, Java 7, Social Behavioral Research',
} as const;

export const RESUME_NONPROFIT = {
  title: 'Director of Operations',
  organisation: 'The Kaw Project Inc',
  dates: '05/2021 – Present',
  body: 'Strategy and daily operations for a nonprofit advancing arts education: budgeting, resource allocation, program development, donor and stakeholder relations.',
} as const;

export const RESUME_FOOTER = {
  lead: 'FULL EVIDENCE SYSTEM, WITH SOURCES AND BOUNDARIES:',
  personalHref: PUBLISHED_SITES.personal,
} as const;

/**
 * Facts this corpus does **not** contain, recorded so that their absence is a stated
 * position rather than an oversight, and so nobody fills them in from a job posting.
 *
 * It is empty, and that is a result rather than a shrug.
 *
 * This list has held three entries for most of the project: no established frontend
 * framework, no per-audience product ownership, and a title-only 2016–2019. Each was
 * true of the record as supplied at the time, each was rendered on the application
 * surface as an open question rather than quietly dropped, and each has since been
 * answered by the owner. React, Next.js and Sitecore are durable facts. The member and
 * broker/employer portals are durable facts, attributed to the team that owned them.
 * Contact Preference and Fee Schedule are durable facts with a single named author.
 *
 * Closing a gap once it is genuinely answered is the other half of recording it. A page
 * that keeps asking a question it can now answer is not being careful, it is being
 * decorative, and the dashed box stops meaning anything the next time one is needed.
 *
 * ## What is deliberately not in here
 *
 * Three things a reader might expect and will not find, because none of them is an
 * *evidence* gap:
 *
 * - **The exact year TypeScript entered the picture at BlueCross.** An omission. No
 *   decision rides on it, so printing it as an open question spends the reader's
 *   attention on the wrong thing.
 * - **An exhaustive broker or employer feature inventory.** The surfaces, their
 *   ownership and their representative capabilities are established. A complete
 *   catalogue of a portal nobody outside the company can open is not something a résumé
 *   needs, and its absence blocks no conclusion a reader is trying to reach.
 * - **GraphQL.** It is on the target role's published stack and there is no record of
 *   it here, so it is simply not claimed. An absence is not a gap; a gap is a question
 *   the reader would otherwise be left holding, and nobody is left wondering whether an
 *   unlisted technology was used.
 *
 * The mechanism stays. `HistoryRecord.unresolved` still resolves against this list, the
 * unresolved rendering path is still covered by a test, and the next unanswered question
 * gets recorded here and shown on the page exactly as the last three were.
 */
export const UNVERIFIED: readonly {
  id: string;
  fact: string;
  why: string;
}[] = [];
