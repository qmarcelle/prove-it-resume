import type { EvidenceRef } from '@/lib/types';

/**
 * Site-level copy and the small set of links that were actually supplied.
 *
 * `github` is the only external destination confirmed by the design export besides the
 * Tally case study. It is used as a *profile* link (header, hero, career, footer) and
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
  /*
   * The product half was missing and the record supports it.
   *
   * This line was six infrastructure nouns. `/linear` says "full-stack" in its first
   * sentence because the corpus establishes it, and the durable surface saying less than
   * the tailored one is the wrong way round: an application lens may reorder emphasis,
   * never carry a claim the root cannot. Nothing here is new, it is the same record
   * stated where a reader arriving without a role in mind will meet it.
   */
  supporting:
    'Customer-facing product engineering and the platforms underneath it: MCP and tool surfaces, repository intelligence, developer platforms, CI/CD integration, agent coordination, and the evidence needed to determine whether the resulting system actually works.',
  availability: 'AVAILABLE FOR STAFF / PRINCIPAL AI PLATFORM WORK',
  capabilities: [
    'MCP',
    'AGENTIC SYSTEMS',
    'FULL-STACK PRODUCT',
    'DEVELOPER PLATFORMS',
    'CI/CD',
    'REPOSITORY INTELLIGENCE',
    'ENTERPRISE HEALTHCARE',
  ],
  github: 'https://github.com/qmarcelle',
  githubLabel: 'github.com/qmarcelle',
  /*
   * The organisation, distinct from the personal profile, and used in exactly one place.
   *
   * "Selected Marcelle Labs work" pointed at `github.com/qmarcelle`, which is a personal
   * profile rather than the thing the row names: a reader following it landed on a list
   * of everything this person has ever pushed and had to go looking for the work the
   * sentence promised. `github.com/Marcelle-Labs` is where that work actually is, and it
   * carries `interlock` and `never-ask-twice` publicly, which are two of the systems
   * this site claims.
   *
   * It is still an index rather than an artifact, so it stays out of the evidence model:
   * the header, hero and footer keep the personal profile as a *profile* link, and no
   * evidence row points at either. `content.test.ts` holds both to that.
   */
  organisation: 'https://github.com/Marcelle-Labs',
  organisationLabel: 'github.com/Marcelle-Labs',
  /*
   * The canonical origin this artifact is published at.
   *
   * Absent for most of this project's life, and the absence was honest at the time: no
   * verified domain had been supplied, so `layout.tsx` set no `metadataBase`, the
   * sitemap emitted root-relative `<loc>` values, and every route's Open Graph card fell
   * back to the durable page's.
   *
   * It is no longer absent. The résumé PDFs print `qwynn.marcellelabs.io/linear` in
   * their footer and the repository publishes the same host, so a shared link resolving
   * to a generic card was a stale comment rather than a missing fact. Stated once here
   * because three separate things need it: `metadataBase`, the sitemap, and the
   * per-route social cards.
   *
   * `content.test.ts` asserts it is an absolute https origin with no trailing slash,
   * which is what `new URL()` in the layout requires.
   */
  origin: 'https://qwynn.marcellelabs.io',
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
 * can be downloaded. Which generated file a given page serves is decided by
 * `resumePdfPath`; one per lens in `ALL_RESUME_LENSES`, so the count follows the
 * registry rather than being stated here and going stale, because a lens changes the
 * masthead title and therefore the artifact, while the fact of having a résumé is the
 * same fact everywhere.
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
 * `#`. All three now resolve: Marcelle Labs to the live site, and LinkedIn and Email
 * to destinations the owner supplied directly. Publishing a contact address was the
 * owner's decision to make, and it has been made: these were never inferred.
 *
 * Email is the one record here that is not a web page. It keeps `verified: true`
 * because the rule that flag encodes is "this destination is the thing the row claims",
 * and a `mailto:` reaches the stated address. What it is *not* is external evidence, so
 * `content.test.ts` enumerates it out of the absolute-https check rather than loosening
 * that check for everything.
 *
 * The raw values sit in `CONTACT` rather than inline because the résumé's masthead
 * prints the same address and profile, and a contact detail that exists twice is a
 * contact detail that will eventually be updated once. `PROFILES` is the evidence-model
 * view of them; `CONTACT` is the values themselves.
 */
export const CONTACT = {
  email: 'qwynn@marcellelabs.io',
  linkedin: 'https://www.linkedin.com/in/qmarcelle',
  linkedinLabel: 'linkedin.com/in/qmarcelle',
} as const;

export const PROFILES: readonly EvidenceRef[] = [
  {
    id: 'linkedin',
    kind: 'source',
    title: 'LinkedIn',
    href: CONTACT.linkedin,
    verified: true,
  },
  {
    id: 'email',
    kind: 'source',
    title: 'Email',
    href: `mailto:${CONTACT.email}`,
    verified: true,
  },
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
      /*
       * The dated span, not a rounded figure.
       *
       * This read "~10 YEARS", which is the same error as the retired "8 years in
       * technology" pointing the other way: the tenure is 08/2016 to 03/2026, so a tilde
       * rounding it *up* to ten claims more than the dates support, on a page whose
       * argument is that its claims can be checked. The span states itself and needs no
       * qualifier.
       */
      meta: '2016 – 2026',
      /*
       * The arc rather than a restatement of the title. The body used to say "Nearly a
       * decade working inside enterprise healthcare engineering environments", directly
       * beneath a heading reading "Enterprise healthcare engineering", which spent the
       * one line this entry gets on saying its own name again.
       */
      body: 'Provider applications first, hands-on. Then the member, broker and employer portal estate: the browser, the APIs behind it, and the enterprise data underneath. Then the team that delivered it.',
      /*
       * Product and platform, in that order.
       *
       * This list was ten infrastructure themes and no product signal at all: a reader
       * arriving here could not tell that any of the work was customer-facing, while
       * `/linear` states the front end, the portals and the surfaces by name. That was
       * not a positioning choice, it was drift. The durable corpus establishes all of
       * it, and `content.test.ts` now holds every tag to a fact that exists there.
       */
      tags: [
        'React / Next.js',
        'Sitecore customer portals',
        'member, broker and employer surfaces',
        'multi-tenant architecture',
        'Node.js services and enterprise data',
        'legacy Java systems',
        'CI/CD',
        'Kubernetes / OpenShift',
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
