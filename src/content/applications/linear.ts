import type { ApplicationLens } from '@/lib/types';
import { prioritiseMapping } from '@/lib/mapping';
import { LINEAR_RECEIPTS } from '../linear/receipts';
import { defaultRole } from '../roles/default';

/**
 * The Linear application surface, served at `/linear`.
 *
 * ## Why this is an application lens and not a role lens
 *
 * A role lens answers "what should someone hiring for *this kind of problem* read
 * first?" and lives at `/role/<slug>`, deliberately generic and reusable. This answers
 * "what should the person evaluating me at *this company* read first?", and it needs
 * things a role lens has no business carrying: its own route, its own hero framing, its
 * own page order, its own résumé content projection, and curated receipts from a
 * private workspace. Adding those to `RoleLens` as optional fields would leave every
 * generic lens carrying five nulls and turn "does this lens own a page?" into a
 * question you answer by reading the object.
 *
 * ## What it still cannot do
 *
 * It projects. `proofOrder` reorders the durable proofs; `mapping` promotes durable
 * rows via `prioritiseMapping` rather than writing new ones, which is asserted in
 * `role-lens.test.ts` for every lens including this one. The section copy below is
 * framing; it names no system, states no metric, and makes no claim the proofs do not
 * already carry. `receipts` is the single place this lens introduces material, and that
 * material is typed, boundary-bearing, unlinked, and tested.
 *
 * ## Why the proofs run in this order
 *
 * The order is the design direction's: Never Ask Twice, Repository Intelligence,
 * Interlock, Vreko. It runs from the reader's own product problem outward: agent
 * memory is the nearest thing in the corpus to what they build, repository context is
 * the surface underneath it, and coordination under concurrent agents is the hardest
 * claim and the one carrying a frozen packet and an independent verifier, so it lands
 * last of the three rather than first.
 *
 * Vreko is the strongest MCP artifact in the corpus and the least differentiating for
 * a reader who already operates an agent platform, so it is demoted to the close. The
 * direction removes it from the sequence entirely; this surface may reorder evidence
 * and may not remove it, so the demotion is carried by the `inline` frame instead.
 */
export const linearApplication: ApplicationLens = {
  kind: 'application',
  slug: 'linear',
  publicPath: '/linear',
  organisation: 'Linear',
  roleTitle: 'Staff AI Product & Platform Engineer',
  resumeTitle: 'Staff AI Product & Platform Engineer',
  resumeProjection: 'linear',
  roleFitHeading: 'Where this work already touches yours.',
  proofOrder: ['repository-intelligence', 'interlock', 'vreko'],
  mapping: prioritiseMapping(defaultRole.mapping, [
    'Build production-grade agent systems',
    'Persist agent state across sessions',
    'Introduce agents into developer workflows',
    'Integrate agents with enterprise metadata systems',
    'Explain architecture rather than hide behind AI-generated code',
  ]),
  showAvailability: true,

  hero: {
    eyebrow: 'AI PRODUCTS · AGENT SYSTEMS · FULL-STACK PRODUCT ENGINEERING',
    headline:
      'I build AI products and the systems that make them reliable in production.',
    thesis: 'Important evidence should be easy to find at decision time.',
    supporting:
      'Nearly a decade building production software in regulated healthcare, and two and a half years leading the teams doing it. The work was customer-facing and full-stack: member, broker and employer portals in React through Next.js and Sitecore, over the services, identity and delivery pipelines beneath them. Lately, agent products end to end: memory, coordination, repository context, and the evaluation that says whether any of it worked. Linear is already the control plane I run agent execution through.',
    capabilities: [
      'AGENT PRODUCTS',
      'AGENT MEMORY',
      'COORDINATION & RELIABILITY',
      'MCP & TOOL SURFACES',
      'FULL-STACK PRODUCT',
      'ENTERPRISE DELIVERY',
    ],
    availability: 'AVAILABLE FOR STAFF AI PRODUCT & PLATFORM WORK',
  },

  /*
   * The reading order of this surface, and the only place it is stated.
   *
   * ## One ordinal system on the page, and this is it
   *
   * A visible number here means one thing: *where you are in the reading order*. It is
   * stamped from position by `numberSections`, so the rail, the header nav, the skip
   * link and every section head are one sequence by construction.
   *
   * Three things used to count, and two of them disagreed. The section eyebrows carried
   * `AI PRODUCT PROOF · 01` while the hero's Evidence Index numbered its own list `01`,
   * so "01" was Never Ask Twice in the body and Repository Intelligence in the hero,
   * and the hero's `01` linked to a section printed as `04`. A reader had to ask which
   * `01` they were looking at, which is a question no page should make them ask.
   *
   * Two of the three are gone. The eyebrow now names the *kind* of section: an
   * identity, not a position: `AI PRODUCT PROOF`, `PLATFORM DEPTH`. The Evidence Index
   * lists names and status and does not count at all. The only ordinal left below a
   * section head is a stage counter inside one interaction, which is local to that
   * control and never leaves it.
   *
   * ## Identity is a separate field from position
   *
   * `id` is permanent and semantic; `n` is derived and moves. Reordering this list
   * renumbers the page and invalidates no shared link.
   *
   * The proofs are listed here by id rather than left to be inferred from `proofOrder`,
   * so this list is a complete statement of the page. `role-lens.test.ts` asserts the
   * two agree, which is what keeps `proofOrder`: the thing the evidence projection
   * reads: from silently disagreeing with the thing the reader sees.
   *
   * The résumé bridge and the closing call to action are deliberately not sections of
   * this sequence. They are the handoff after the argument ends, they carry no claim,
   * and numbering them would say the page has one more thing to prove than it does.
   */
  pagePlan: [
    {
      id: 'product-history',
      label: 'Product history',
      eyebrow: 'PRODUCT ENGINEERING HISTORY',
      frame: 'standard',
    },
    {
      id: 'linear-in-practice',
      label: 'Linear in practice',
      eyebrow: 'LINEAR IN PRACTICE',
      frame: 'band',
    },
    {
      id: 'never-ask-twice',
      label: 'Never Ask Twice',
      eyebrow: 'AI PRODUCT PROOF',
      frame: 'standard',
    },
    {
      id: 'repository-intelligence',
      label: 'Repository Intelligence',
      eyebrow: 'AI PRODUCT PROOF',
      frame: 'band',
      proof: 'repository-intelligence',
    },
    {
      id: 'interlock',
      label: 'Interlock',
      eyebrow: 'AI PRODUCT PROOF',
      frame: 'standard',
      proof: 'interlock',
    },
    /*
     * Vreko, demoted rather than dropped.
     *
     * The design direction takes it out of the proof sequence entirely and leaves one
     * row of platform depth. That is a judgement about emphasis, and it is right about
     * the emphasis, but this surface may reorder evidence and may not remove it, so
     * the section keeps its diagram, its recorded contradictions and its boundary, and
     * the demotion is carried by the frame instead.
     */
    {
      id: 'vreko',
      label: 'Vreko',
      eyebrow: 'PLATFORM DEPTH',
      frame: 'inline',
      proof: 'vreko',
    },
    {
      id: 'product-judgment',
      label: 'Product judgment',
      eyebrow: 'PRODUCT JUDGMENT',
      frame: 'standard',
    },
    {
      id: 'career',
      label: 'Career',
      eyebrow: 'PRODUCT ENGINEERING RECORD',
      frame: 'standard',
    },
    {
      id: 'claim-ledger',
      label: 'Claim ledger',
      eyebrow: 'CLAIM LEDGER',
      frame: 'inline',
    },
  ],

  receipts: LINEAR_RECEIPTS,

  sections: {
    history: {
      heading:
        'Nearly a decade of production software before any of this was called an agent.',
      /*
       * "Nearly a decade" is the durable phrasing in `CAREER` and in
       * `RESUME_CAREER_DURATION`, and it is the phrasing this section keeps. The
       * employment span runs 2016–2026; rounding that up to a flat ten for a reader who
       * would be more impressed by ten is the exact move this site exists to argue
       * against. The résumé used to say "8 years in technology" a few lines above that
       * same span, which was the same failure pointing the other way, and it is retired.
       */
      body: 'The AI work below is recent. The habit underneath it is not: nearly a decade inside regulated healthcare engineering, where a release that looks fine and is wrong costs more than one that fails loudly. The work was customer-facing (member, broker and employer portals, built as well as led) alongside the microservice architecture, identity, and delivery pipelines that carry them. Then two and a half years leading the teams doing both halves.',
      boundary:
        'Themes are surfaced in place of employer-confidential details. The portals were delivered by a team, and the named initiatives are enterprise programmes led or aligned across teams rather than products owned end to end by one engineer. The conventional chronology, with titles and dates, is in the résumé below.',
    },
    inPractice: {
      heading: 'I already run agent execution with Linear as the control plane.',
      body: 'Not an opinion formed from the documentation. These are decisions taken while wiring agent work through Linear in a private workspace: what to delegate natively, where the orchestration boundary belongs, and what an agent has to emit for the issue to still make sense to a human a month later.',
      boundary:
        'Curated summaries of private workspace decisions, written for publication rather than exported from it. No public artifact stands behind them, so under this site’s own rule they are stated claims, not verified evidence. Everything below this section is the part you can open and check.',
    },
    judgement: {
      heading: 'Ask me to defend a decision.',
    },
  },

  metaTitle: 'Qwynn Marcelle · Staff AI Product & Platform Engineer · Linear',
  metaDescription:
    'AI product and agent-platform evidence, assembled for Linear: agent memory evaluated by ablation, a controlled coordination experiment, repository intelligence as an open standard, and Linear already in use as an execution control plane.',
  isDefault: false,
};
