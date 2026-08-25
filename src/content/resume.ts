import { CONTACT } from './site';
import { PUBLISHED_SITES } from './published';

/**
 * The conventional résumé, as data.
 *
 * Ported from the Claude Design export `Prove It Resume - PDF.dc.html`, which is an
 * explicitly paginated two-page letter document rather than a flowing one. The copy is
 * carried over verbatim; the structure became this model so that the same content can
 * render to screen and to PDF without a second copy drifting from the first.
 *
 * Two things differ from the export, both deliberate:
 *
 * 1. **The VERIFY links resolve to published sites.** The export pointed Vreko's at the
 *    generic GitHub profile. Vreko, workspace.json and Interlock all publish real sites
 *    now, so all three point at those — the same rule the evidence rows follow.
 * 2. **`targetTitle` comes from the role lens** rather than being a standalone prop, so
 *    the PDF a reader downloads from a role page carries that lens's title.
 *
 * The employer is named here although `CAREER` in `site.ts` deliberately abstracts it.
 * That is not a contradiction: a résumé names employers and dates because the format
 * exists to be checked against a background screen, while the public page surfaces
 * themes instead. The résumé states no proprietary metrics either way.
 */

export type ResumeSystem = {
  id: string;
  name: string;
  /** Renders the name in the mono face, for file-shaped names like `workspace.json`. */
  nameIsCode?: boolean;
  summary: string;
  bullets: string[];
  /** Tool chain, rendered as a single mono line under the bullets. */
  stack: string;
  /** The published site this system can be checked against. */
  verifyHref: string;
};

export type ResumeRole = {
  id: string;
  title: string;
  dates: string;
  bullets?: string[];
};

/**
 * Declared as typed arrays rather than `as const` members: a const assertion narrows
 * each entry to its own literal shape, so an optional field absent from one entry stops
 * existing on the union and the renderer can no longer ask about it.
 */
const RESUME_SYSTEMS: readonly ResumeSystem[] = [
  {
    id: 'vreko',
    name: 'Vreko',
    summary: 'MCP and codebase intelligence for agentic development',
    bullets: [
      'MCP-based intelligence surface exposing repository and session context to compatible AI assistants; transport, protocol surface, and intelligence layer held separate.',
      'Agent lifecycle of brief → pulse → learn → end across local and hosted execution paths, each with its own authentication and deployment boundary.',
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
      'Designed and steward an Apache-2.0 specification — schema, producer tooling, governance — for committing repository intelligence in a deterministic, tool-consumable form.',
      'Implemented it for Codex through hooks and MCP, then integrated it with DataHub in Tally: resolved the dbt-to-git path mismatch where the naive join silently returns zero, and checked writeback independently of the API response.',
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
      'Paired-arm experiment on shared-state mutation: two locally valid intents produce an invalid joint outcome; an evidence-bound withhold-and-serialize decision keeps joint state inside the bounded constraint.',
      'Execution separated from observation: frozen evidence packet, independent verifier, explicitly stated non-claims.',
    ],
    stack: 'Google ADK · Vertex AI · Cloud Run · MCP proxy · counterfactual evaluation',
    verifyHref: PUBLISHED_SITES.interlock,
  },
];

const RESUME_ROLES: readonly ResumeRole[] = [
  {
    id: 'team-lead',
    title: 'Engineering Team Lead',
    dates: '10/2023 – 03/2026',
    bullets: [
      'Led enterprise modernization from legacy Java monoliths to REST-based Node.js microservices, improving developer velocity and platform scalability.',
      'Championed AI-assisted engineering and test automation using Cursor AI, Playwright, and Cypress to reduce manual overhead within corporate AI constraints.',
      'Oversaw DevOps transformation using Azure DevOps, OpenShift, and Tekton, standardizing CI/CD and shortening release cycles.',
      'Aligned high-visibility initiatives including Portal Refresh, CIAM, and Shared Health across security, product, middleware, and engineering teams.',
      'Optimized authentication workflows with Ping Security and CyberArk, strengthening compliance and system resilience.',
    ],
  },
  {
    id: 'devops-strategy',
    title: 'Engineering & DevOps Strategy Lead',
    dates: '08/2022 – 10/2023',
    bullets: [
      'Developed CI/CD frameworks with Azure DevOps and Argo CD for scalable, secure application deployments.',
      'Established backlog governance and prioritized mission-critical work when product ownership capacity was constrained, preventing uncontrolled scope growth.',
      'Introduced AI-assisted test automation to accelerate release cycles and reduce QA bottlenecks.',
    ],
  },
  {
    id: 'systems-analyst',
    title: 'Application Systems Analyst Specialist / Technical Lead',
    dates: '08/2019 – 08/2022',
    bullets: [
      'Architected high-availability microservices to improve reliability and application performance.',
      'Collaborated with security teams to establish IAM protocols using OAuth and SAML, supporting enterprise compliance.',
    ],
  },
  {
    id: 'developer',
    title: 'Application Developer / Analyst · Application Developer',
    dates: '08/2016 – 08/2019',
  },
];

export const RESUME_DOCUMENT = {
  name: 'QWYNN MARCELLE',
  revision: 'REV 2026.08',
  /**
   * Sheets in the rendered document. Stated here so the résumé call to action can say
   * how long it is without a second copy of the number living in the CTA; the document
   * is two explicit page boxes and `resume.spec.ts` asserts exactly that count, so the
   * two cannot drift apart silently.
   */
  pages: 2,
  domains: 'AI PLATFORM · DEVELOPER SYSTEMS · SOFTWARE ARCHITECTURE',
  location: 'Ooltewah, Tennessee',
  /*
   * Ordered by how a reader is most likely to act on them: reply, check the profile,
   * read the code, read the site. Four entries plus the location no longer fit on one
   * line, so the row wraps once — which the design allows, and which costs ~21px on a
   * page that has no room to reflow. `resume.spec.ts` holds it to two lines, so a fifth
   * entry fails as a test rather than as a footer clipped off the bottom of the sheet.
   */
  links: [
    { label: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { label: CONTACT.linkedinLabel, href: CONTACT.linkedin },
    { label: 'github.com/qmarcelle', href: 'https://github.com/qmarcelle' },
    { label: 'qwynn.marcellelabs.io', href: PUBLISHED_SITES.personal },
  ],

  profile: {
    heading: 'I build the infrastructure between AI agents and production software.',
    body: 'Engineering leader with 8 years in technology and 2.5 years leading agile software teams. Modernized legacy platforms into scalable, resilient architectures using Node.js, REST APIs, microservices, cloud-native delivery, CI/CD, and identity and access management. Recent independent work builds the layer between coding agents and production systems: MCP and tool surfaces, repository intelligence, and controlled evaluation of whether the resulting system actually works. Cross-functional leadership across engineering, product, security, middleware, and operations.',
  },

  systemsNote: 'Independent systems work · Marcelle Labs',
  systems: RESUME_SYSTEMS,

  alsoLabel: 'ALSO',
  also: {
    name: 'Never Ask Twice',
    body: '— enterprise support MemoryAgent carrying customer context across sessions, evaluated with a live re-ask-rate ablation. Agent memory · pgvector / Postgres · MCP · TypeScript.',
  },

  boundaryLabel: 'BOUNDARY',
  boundary:
    'Public source and recorded evidence establish that these systems exist and what was observed; they do not establish adoption or production scale outside the repositories where they have been applied.',

  employer: {
    name: 'BlueCross BlueShield of Tennessee',
    span: '2016 – 2026',
    location: 'Chattanooga, TN',
    note: 'Regulated healthcare production environments',
  },
  roles: RESUME_ROLES,

  stackLabel: 'TECHNICAL STACK',
  stack:
    'Node.js · TypeScript · Java · REST & microservices · MCP · JSON Schema · Azure DevOps · Tekton · Argo CD · OpenShift / Kubernetes · CI/CD · OAuth · SAML · IAM (Ping, CyberArk) · Playwright · Cypress · SQL (ANSI) · GitHub · Google Cloud (ADK, Vertex AI, Cloud Run) · Postgres / pgvector · Agile & Scrum',

  educationLabel: 'EDUCATION',
  education: [
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
  ],

  certificationsLabel: 'CERTIFICATIONS',
  certifications:
    'Professional Agile Leadership I (PAL I) · Professional Scrum Master I (PSM I)',
  certificationsEarlier:
    '· earlier: SQL (ANSI) Fundamentals, Java 7, Social Behavioral Research',

  nonprofitLabel: 'NONPROFIT LEADERSHIP',
  nonprofit: {
    title: 'Director of Operations',
    organisation: 'The Kaw Project Inc',
    dates: '05/2021 – Present',
    body: 'Strategy and daily operations for a nonprofit advancing arts education: budgeting, resource allocation, program development, donor and stakeholder relations.',
  },

  footerLead: 'FULL EVIDENCE SYSTEM, WITH SOURCES AND BOUNDARIES:',
  footerLink: { label: 'qwynn.marcellelabs.io ↗', href: PUBLISHED_SITES.personal },
  footerTrailing: 'AI PLATFORM & DEVELOPER SYSTEMS',
} as const;
