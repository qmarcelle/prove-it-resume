import type { EvidenceRef } from '@/lib/types';

/**
 * Site-level copy and the small set of links that were actually supplied.
 *
 * `github` is the only external destination confirmed by the design export besides the
 * Tally case study. It is used as a *profile* link — header, hero, career, footer — and
 * deliberately not as a per-artifact evidence target, because a profile page is not the
 * repository an evidence row names.
 */
export const SITE = {
  name: 'Qwynn Marcelle',
  wordmark: 'QWYNN MARCELLE',
  wordmarkSuffix: '/ PROVE IT RESUME',
  role: 'AI Platform & Developer Systems',
  affiliation: 'Founder, Marcelle Labs · Steward, workspace.json',
  revision: 'REV 2026.08',
  eyebrow: 'AI PLATFORM · DEVELOPER SYSTEMS · TECHNICAL LEADERSHIP',
  headline: 'I build the infrastructure between AI agents and production software.',
  thesis: 'Important evidence should be easy to find at decision time.',
  supporting:
    'MCP and tool surfaces, repository intelligence, developer platforms, CI/CD integration, agent coordination, and the evidence needed to determine whether the resulting system actually works.',
  availability: 'AVAILABLE FOR STAFF / PRINCIPAL AI PLATFORM WORK',
  capabilities: [
    'MCP',
    'AGENTIC SYSTEMS',
    'DEVELOPER PLATFORMS',
    'CI/CD',
    'REPOSITORY INTELLIGENCE',
    'ENTERPRISE HEALTHCARE',
  ],
  github: 'https://github.com/qmarcelle',
  githubLabel: 'github.com/qmarcelle',
} as const;

/**
 * Résumé asset.
 *
 * The design export supplied no file, so this record sat unresolved and every résumé
 * CTA rendered as a stated gap. There is now a résumé: `Prove It Resume - PDF.dc.html`
 * was ported to `/resume/print`, and `pnpm resume:pdf` renders it with Chromium's print
 * engine into `public/`.
 *
 * `href` is the neutral lens's file and is what this record *means*: a résumé exists and
 * can be downloaded. Which of the three generated files a given page serves is decided
 * by `resumePdfPath`, because a role lens changes the masthead title and therefore the
 * artifact, while the fact of having a résumé is the same fact everywhere.
 */
export const RESUME: EvidenceRef = {
  id: 'resume',
  kind: 'source',
  title: 'Traditional résumé (PDF)',
  description: 'Conventional chronology, for processes that require one.',
  href: '/qwynn-marcelle-resume.pdf',
  verified: true,
};

/**
 * Contact and profile destinations.
 *
 * The export pointed LinkedIn and Email at `#resume` and the Marcelle Labs link at
 * `#`. Marcelle Labs now resolves to the live site. LinkedIn and Email stay
 * unresolved on purpose: no profile URL was supplied, and publishing a contact
 * address is the owner's decision, not something to infer.
 */
export const PROFILES: readonly EvidenceRef[] = [
  { id: 'linkedin', kind: 'source', title: 'LinkedIn', verified: false },
  { id: 'email', kind: 'source', title: 'Email', verified: false },
  {
    id: 'marcelle-labs',
    kind: 'source',
    title: 'Professional work: Marcelle Labs',
    href: 'https://marcellelabs.io',
    verified: true,
  },
] as const;

export const PROBLEM_SECTION = {
  eyebrow: '01 / OPERATING THESIS',
  heading: 'AI agents are easy to demo. Production developer systems are harder.',
  facets: [
    {
      title: 'Context',
      body: 'Agents make decisions with incomplete, stale, fragmented, or poorly surfaced repository context.',
    },
    {
      title: 'Integration',
      body: 'Giving an agent access to another tool does not automatically mean the tool will be considered at the right decision point.',
    },
    {
      title: 'Evidence',
      body: 'A successful-looking agent run is not enough. Production systems need observable boundaries, reproducible behavior, and explicit limitations.',
    },
  ],
  pullquote: 'Most of my recent work explores different parts of this boundary.',
} as const;

export const APPROACH = {
  kicker: 'HOW I WOULD ENTER AN UNFAMILIAR PLATFORM',
  heading: 'Start narrow. Establish evidence. Expand only if useful.',
  steps: [
    {
      n: '01',
      title: 'Find one costly workflow',
      body: 'Observe the existing developer journey and identify a bounded problem worth changing.',
    },
    {
      n: '02',
      title: 'Establish the baseline',
      body: 'Define the behavior and outcome we are trying to improve before adding an agent.',
    },
    {
      n: '03',
      title: 'Ship one instrumented path',
      body: 'Integrate the smallest useful agent/tool surface into the real workflow with explicit failure boundaries.',
    },
    {
      n: '04',
      title: 'Compare and expand',
      body: 'Measure whether it changed the target outcome. Keep, revise, or remove it before scaling the pattern.',
    },
  ],
} as const;

export const CAREER = {
  eyebrow: '06 / THE EXPERIENCE BENEATH THE PROOF',
  heading: "The systems are recent. The production discipline isn't.",
  entries: [
    {
      id: 'enterprise-healthcare',
      title: 'Enterprise healthcare engineering',
      meta: '~10 YEARS',
      body: 'Nearly a decade working inside enterprise healthcare engineering environments.',
      tags: [
        'legacy Java systems',
        'Node / TypeScript modernization',
        'platform architecture',
        'CI/CD',
        'Kubernetes / OpenShift',
        'Argo CD',
        'IAM',
        'OAuth / SAML',
        'regulated production environments',
        'engineering leadership',
      ],
      note: 'Themes are surfaced in place of employer-confidential details. No proprietary metrics.',
    },
    {
      id: 'marcelle-labs',
      title: 'Marcelle Labs',
      meta: 'FOUNDER / TECHNICAL EXECUTION',
      body: 'Founder-led engineering work across healthcare platforms, AI automation, and production systems.',
    },
  ],
  currentHeading: 'Independent technical systems',
  currentMeta: 'CURRENT',
} as const;

export const FINAL_CTA = {
  heading: "Don't take the résumé's word for it.",
  body: 'Inspect the systems. Read the decisions. Run the checks. Then ask me why I built them that way.',
} as const;

export const RESUME_BRIDGE = {
  heading: 'Need the conventional version?',
  body: 'The evidence above is how I prefer to explain my work. The conventional chronology is here when your process needs it.',
} as const;
