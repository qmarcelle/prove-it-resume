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

/** A bullet, addressable so a projection can select and order without copying text. */
export type ResumeBullet = {
  id: string;
  text: string;
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
   * copy was a duplicate; and `qwynn.marcellelabs.io` set beside
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
 * lead role on platform modernization, and a product-oriented projection opens it on
 * the customer-facing initiatives instead. Same sentences, different first line.
 *
 * The 2016–2019 developer period carries no bullets. That is not an oversight and not
 * a space decision — no verified product or frontend detail for those three years
 * exists in this corpus, and inventing one to balance the page is exactly the failure
 * this whole repository argues against. See `UNVERIFIED` below.
 */
export const RESUME_ROLES: readonly ResumeRoleFact[] = [
  {
    id: 'team-lead',
    title: 'Engineering Team Lead',
    dates: '10/2023 – 03/2026',
    bullets: [
      {
        id: 'team-lead:modernization',
        text: 'Led enterprise modernization from legacy Java monoliths to REST-based Node.js microservices, improving developer velocity and platform scalability.',
      },
      {
        id: 'team-lead:ai-engineering',
        text: 'Championed AI-assisted engineering and test automation using Cursor AI, Playwright, and Cypress to reduce manual overhead within corporate AI constraints.',
      },
      {
        id: 'team-lead:devops',
        text: 'Oversaw DevOps transformation using Azure DevOps, OpenShift, and Tekton, standardizing CI/CD and shortening release cycles.',
      },
      {
        id: 'team-lead:initiatives',
        text: 'Aligned high-visibility initiatives including Portal Refresh, CIAM, and Shared Health across security, product, middleware, and engineering teams.',
      },
      {
        id: 'team-lead:auth',
        text: 'Optimized authentication workflows with Ping Security and CyberArk, strengthening compliance and system resilience.',
      },
    ],
  },
  {
    id: 'devops-strategy',
    title: 'Engineering & DevOps Strategy Lead',
    dates: '08/2022 – 10/2023',
    bullets: [
      {
        id: 'devops-strategy:frameworks',
        text: 'Developed CI/CD frameworks with Azure DevOps and Argo CD for scalable, secure application deployments.',
      },
      {
        id: 'devops-strategy:governance',
        text: 'Established backlog governance and prioritized mission-critical work when product ownership capacity was constrained, preventing uncontrolled scope growth.',
      },
      {
        id: 'devops-strategy:test-automation',
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
        id: 'systems-analyst:microservices',
        text: 'Architected high-availability microservices to improve reliability and application performance.',
      },
      {
        id: 'systems-analyst:iam',
        text: 'Collaborated with security teams to establish IAM protocols using OAuth and SAML, supporting enterprise compliance.',
      },
    ],
  },
  {
    id: 'developer',
    title: 'Application Developer / Analyst · Application Developer',
    dates: '08/2016 – 08/2019',
    bullets: [],
  },
];

/**
 * The systems, as durable facts.
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
        text: 'MCP-based intelligence surface exposing repository and session context to compatible AI assistants; transport, protocol surface, and intelligence layer held separate.',
      },
      {
        id: 'vreko:lifecycle',
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
        text: 'Designed and steward an Apache-2.0 specification — schema, producer tooling, governance — for committing repository intelligence in a deterministic, tool-consumable form.',
      },
      {
        id: 'workspace-json:integration',
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
        text: 'Paired-arm experiment on shared-state mutation: two locally valid intents produce an invalid joint outcome; an evidence-bound withhold-and-serialize decision keeps joint state inside the bounded constraint.',
      },
      {
        id: 'interlock:separation',
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
        text: 'Enterprise support MemoryAgent that carries customer context across sessions, with an explicit forgetting policy rather than unbounded accumulation.',
      },
      {
        id: 'never-ask-twice:ablation',
        text: 'Evaluated by a re-ask-rate ablation against fixed fixtures and a stubbed model client, so the score is deterministic and the memory layer is the only thing varying.',
      },
    ],
    stack: 'Agent memory · pgvector / Postgres · MCP · TypeScript · cloud execution',
    verifyHref:
      'https://github.com/Marcelle-Labs/never-ask-twice/blob/main/docs/evaluation.md',
    compact:
      '— enterprise support MemoryAgent carrying customer context across sessions, evaluated with a live re-ask-rate ablation. Agent memory · pgvector / Postgres · MCP · TypeScript.',
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
 * chronology establishes, and what a reader should not read into it. It matters most on
 * a product-oriented projection, where "aligned high-visibility initiatives" could
 * otherwise be read as sole ownership of the products behind them.
 */
export const RESUME_EXPERIENCE_BOUNDARY =
  'Titles, dates, and scope are stated as held. The named initiatives are enterprise programmes this role led or aligned across security, product, middleware, and engineering — not products owned end to end by one engineer. No proprietary metrics are stated.';

/**
 * Every quantity any projection is permitted to state.
 *
 * A projection may reframe. The one thing it must never do is round a number upward
 * for an audience, and prose is where that would happen invisibly. `resume.test.ts`
 * extracts the numbers from every projection's framing copy and fails on anything not
 * listed here, so strengthening a metric is a test failure rather than an edit nobody
 * reviews.
 */
export const RESUME_QUANTITIES: readonly string[] = ['8', '2.5'];

/** The neutral stack line: one undifferentiated run, as the design export had it. */
export const RESUME_STACK_LINE =
  'Node.js · TypeScript · Java · REST & microservices · MCP · JSON Schema · Azure DevOps · Tekton · Argo CD · OpenShift / Kubernetes · CI/CD · OAuth · SAML · IAM (Ping, CyberArk) · Playwright · Cypress · SQL (ANSI) · GitHub · Google Cloud (ADK, Vertex AI, Cloud Run) · Postgres / pgvector · Agile & Scrum';

/**
 * The same capabilities, grouped.
 *
 * A grouping is a projection decision about legibility, but the *membership* is a fact:
 * every item below also appears in `RESUME_STACK_LINE` or in a system's `stack`, and
 * `resume.test.ts` enforces that. That check is the reason there is no "React" row
 * here — see `UNVERIFIED`. Nothing was added because a job description mentioned it.
 */
export const RESUME_CAPABILITY_GROUPS: readonly CapabilityGroupFact[] = [
  {
    id: 'product-web',
    label: 'PRODUCT / WEB',
    items: 'TypeScript · Node.js · REST APIs · Playwright · Cypress',
  },
  {
    id: 'backend-data',
    label: 'BACKEND / DATA',
    items: 'Java · microservices · JSON Schema · Postgres / pgvector',
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
    items: 'OAuth · SAML · IAM (Ping, CyberArk) · CIAM',
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
 * position rather than an oversight — and so nobody fills them in from a job posting.
 *
 * Each of these would strengthen a product-oriented projection. None of them is
 * supported by anything supplied to this repository, so no projection claims them, and
 * `resume.test.ts` fails if any projected string mentions one.
 */
export const UNVERIFIED = [
  {
    id: 'frontend-framework',
    fact: 'Which frontend framework, if any, was used in the 2016–2019 developer period or since.',
    why: 'No source supplied to this repository names one. React, Angular and Vue are all equally unsupported here.',
  },
  {
    id: 'member-broker-employer-products',
    fact: 'Ownership of distinct member, broker, and employer product surfaces.',
    why: 'The corpus names the Portal Refresh, CIAM and Shared Health initiatives and no per-audience product ownership beneath them.',
  },
  {
    id: 'early-developer-detail',
    fact: 'What was built between 08/2016 and 08/2019 beyond the job titles held.',
    why: 'The supplied chronology is title-only for that period.',
  },
] as const;
