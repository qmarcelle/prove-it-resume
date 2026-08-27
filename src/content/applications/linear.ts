import type { ApplicationLens } from '@/lib/types';
import { prioritiseMapping } from '@/lib/mapping';
import { LINEAR_RECEIPTS, LINEAR_RECEIPTS_BOUNDARY } from '../linear/receipts';
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
/**
 * The problems this surface leads with, named once.
 *
 * The same list does two jobs and must not be able to disagree with itself:
 * `prioritiseMapping` moves these rows to the front of the durable mapping, and
 * `mappingFocus` is how many of that front the closing section shows before it asks. A
 * literal `5` beside the list would be a second statement of the same fact, and the
 * failure mode is silent: a sixth problem added here and the count left alone hides a
 * row the lens just promoted.
 */
const MAPPING_FOCUS = [
  'Build production-grade agent systems',
  'Persist agent state across sessions',
  'Introduce agents into developer workflows',
  'Integrate agents with enterprise metadata systems',
  'Explain architecture rather than hide behind AI-generated code',
] as const;

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
  mapping: prioritiseMapping(defaultRole.mapping, MAPPING_FOCUS),
  mappingFocus: MAPPING_FOCUS.length,
  showAvailability: true,

  hero: {
    eyebrow: 'AI PRODUCTS · AGENT SYSTEMS · FULL-STACK PRODUCT ENGINEERING',
    headline:
      'I build AI products and the systems that make them reliable in production.',
    thesis: 'Important evidence should be easy to find at decision time.',
    /*
     * Four sentences, now two, and the two that went are the ones the page grew a better
     * place for.
     *
     * The hero was written when it was the only thing above the proofs. Since the
     * disclosure pass, section 01 opens on the portal estate and renders the surfaces and
     * the capability register itself, and section 02's heading is "I already use Linear as
     * the control plane for agent work", so sentences two and four were the hero
     * summarising two chapters a reader reaches within one scroll, in weaker words than
     * the chapters use.
     *
     * What is left is what a hero is for: the shape of the background, the shape of the
     * recent work, and the Evidence Index beside it saying the rest is below. It states
     * nothing the previous version did not; it stops saying the parts twice.
     */
    supporting:
      'Nearly a decade building customer-facing, full-stack production software in regulated healthcare, and two and a half years leading the teams doing it. Lately, agent products end to end: memory, coordination, repository context, and the evaluation that says whether any of it worked.',
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
      body: 'I started in production support, then built provider-facing applications before moving into the customer portal stack behind Member, Broker, and Employer experiences. Over time the work expanded from React and browser flows into services, identity, delivery, architecture, and eventually leading the full-stack Consumer Portals team.',
      secondBeat:
        'The through-line was leverage: make the next change easier to understand, test, reuse, and ship than the last one. That meant modernizing the application platform, but also learning that architecture only works when the problem and tradeoffs are clear to the people who have to support the decision.',
      stageSummaries: {
        'stage-01':
          'Production support → provider-facing React applications, including Contact Preference and Fee Schedule.',
        'stage-02':
          'Member portal architecture, login/MFA, billing transparency, routing, services, and identity boundaries.',
        'stage-03':
          'Developer feedback loops, Azure DevOps adoption, CI/CD, and platform direction across a constrained delivery system.',
        'stage-04':
          'Led the full-stack Consumer Portals team across Member and shared Broker/Employer experiences, APIs, identity, multi-tenancy, and modernization.',
      },
      /*
       * The four durable audience rows, compressed to one line each.
       *
       * Keyed by `HistoryEntry` id rather than restated in order, so a row added to or
       * renamed in the durable record cannot silently lose its projection here. The
       * enterprise row is kept even though the direction names only three surfaces:
       * dropping it would remove the one line that says the team's services fed
       * consumers beyond the portals, which is the fact that makes this backend work
       * rather than four front ends.
       */
      surfaces: {
        'audience-provider':
          'Contact Preference and Fee Schedule, built hands-on early in the career.',
        'audience-member':
          'Authenticated portal experiences including login/MFA and billing transparency, over services the team owned supplying claims, ID-card and enrollment information.',
        'audience-broker-employer':
          'Shared portal infrastructure the same team owned: authenticated book-of-business visibility, credentialing, and multi-tenancy by requirement.',
        'audience-enterprise':
          "Member information assembled from Facets and other enterprise sources, flowing back out through the team's services to consumers beyond the portals.",
      },
      /*
       * The capability register: six rows, not the four the direction lists.
       *
       * The direction's four are the four a Linear reader asks about, and they are
       * first. But the durable record has six disciplines, and this projection is the
       * only place they are rendered on this surface, so shipping four would delete
       * product delivery and the regulated environment from the page rather than
       * compress them. Six mono rows are still a register a reader scans in seconds;
       * six paragraphs were the density this pass exists to remove.
       */
      capabilities: [
        {
          id: 'discipline-frontend',
          label: 'Frontend',
          items: 'React → Next.js · Sitecore · routing · auth/MFA · Turborepo monorepo',
        },
        {
          id: 'discipline-backend',
          label: 'Services & data',
          items: 'Node.js · REST APIs · Facets + enterprise data',
        },
        {
          id: 'discipline-identity',
          label: 'Identity',
          items: 'CIAM · OAuth/SAML · Ping · multi-tenancy',
        },
        {
          id: 'discipline-release',
          label: 'Delivery',
          items: 'Azure DevOps · OpenShift · Tekton · Argo CD',
        },
        {
          id: 'discipline-product',
          label: 'Product delivery',
          items: 'Customer-facing platform initiatives carried across teams',
        },
        {
          id: 'discipline-regulated',
          label: 'Regulated environment',
          items: 'Nearly a decade of production work inside regulated healthcare',
        },
      ],
      paths: [
        {
          id: 'built',
          invitation: 'What did I actually build?',
          label: 'CUSTOMER SURFACES AND WHAT SAT BEHIND THEM',
        },
        {
          id: 'leadership',
          invitation: 'What changed as I moved from builder to lead?',
          label: 'FROM BUILDER TO LEAD',
          paragraphs: [
            'The technical problem was easier for me to see than the organizational one. I initially assumed the limitations of the existing development model were obvious. They were not. Existing Java expertise, infrastructure investment, and an overloaded roadmap made management’s pushback reasonable.',
            'I started using architecture diagrams as shared decision surfaces rather than documentation after the fact. Making Member, Broker, Employer, shared packages, APIs, identity boundaries, and deployment surfaces visible at once changed the quality of the conversation.',
            'One developer completed a user story in roughly half the usual time once the newer feedback loop let them exercise and validate the change directly. This is one observed story, not a claim that the modernization doubled team productivity.',
            'I was directionally right that engineering leverage mattered, but wrong to assume it could compensate indefinitely for too much concurrent work. Today I would attack both: improve the engineering system and challenge the portfolio-level work in progress.',
          ],
        },
      ],
      boundary:
        'Scope note: named customer surfaces and systems span both hands-on work and later team ownership. The résumé carries the conventional chronology. No portfolio-wide productivity multiplier is claimed.',
    },
    inPractice: {
      heading: 'I already use Linear as the control plane for agent work.',
      body: 'The interesting part has not been whether Linear can launch an agent. It has been deciding what Linear should own natively, what belongs in specialist execution surfaces, and what an agent needs to leave behind so the work is still legible to a human later.',
      boundary:
        /*
         * Composed from the durable constant rather than restated. These two strings were
         * near-identical copies of one claim, one printed on the page and one on the
         * résumé, which is precisely the drift this content model exists to prevent: a
         * correction to the evidence rule would have landed in one and not the other.
         */
        `${LINEAR_RECEIPTS_BOUNDARY} Everything below this section is the part you can open and check.`,
      secondBeat:
        'I have been testing those boundaries in my own workflow rather than treating the platform architecture as an abstract preference. One of the cleaner native paths failed its first repository-context gate, which is exactly the kind of result I want a system to make visible.',
      /*
       * The one thing the orientation layer says about the receipts before a reader
       * asks: that there are three, and how far they can be checked. Enough to
       * establish that deeper material exists without spending the reader's attention
       * on private-workspace decision detail they have not chosen yet.
       */
      signal: '3 curated decisions · private-source verified',
      paths: [
        {
          id: 'native-delegation',
          invitation: 'See the native delegation proof that failed',
          label: 'META-268 · NATIVE DELEGATION VS CUSTOM ORCHESTRATION',
          paragraphs: [
            'Should bounded repository work go through Linear’s native Codex delegation or through a custom orchestration layer?',
            'The simpler native boundary remains desirable, but only when issue and repository context survive the handoff. The first proof reached a Linear Agent Session and still failed the repository-context gate, so I did not promote the architecture preference into a production claim.',
            'Native execution should own bounded repository work when the context contract is proven. Custom orchestration retains routing, governance, cross-tool coordination, and evidence aggregation where those responsibilities are not product-native.',
          ],
        },
        {
          id: 'operating-decisions',
          invitation: 'Inspect the three operating decisions',
          label: 'CURATED RECEIPTS · PRIVATE-SOURCE VERIFIED',
        },
      ],
    },

    /*
     * Never Ask Twice, framed as the customer problem it solved rather than as the
     * memory vocabulary it is built from.
     *
     * The durable record in `never-ask-twice.ts` is unchanged and still carries the
     * question, the surface, the boundary and the evaluation link. What changes here is
     * only the order a reader meets them in: promise first, trust problem second, and
     * the three-tier mechanics only once somebody has asked for architecture.
     */
    memory: {
      heading:
        'A support agent that remembers the customer without making memory opaque.',
      body: 'The product promise was simple: if a customer already told the agent their environment, plan, SLA, or open issue, the next conversation should not begin by asking for all of it again.',
      secondBeat:
        'The harder problem turned out not to be recall. It was making sure remembered facts stayed tenant-scoped, attributable to a real interaction, replaceable when they became stale, and visible when the agent used them.',
      paths: [
        {
          id: 'failures',
          invitation: 'See the failures that changed the design',
          label: 'THREE CORRECTIONS',
          paragraphs: [
            'The write path looked healthy and persisted nothing. A test double let the distillation path pass while the real persistence behaviour was hollow. The fix was to validate candidates against the constrained fact schema and make persistence failure visible.',
            'Tenant isolation existed on read, not write. The read path was scoped correctly, but a fact could still be written under the wrong tenant. The boundary moved to the write path.',
            'The recall explanation was not tied to what the model actually used. An early panel reflected presentation state instead of the cited-facts payload. The UI was rebound to the facts behind the answer.',
            'That changed the thesis for me: governed recall is the product. Remembering more is not useful if scope, source, and revocation are unclear.',
          ],
        },
        {
          id: 'evaluation',
          invitation: 'How did I test whether memory helped?',
          label: 'DETERMINISTIC EVALUATION',
          paragraphs: [
            'The regression harness compares memory behaviour under fixed synthetic fixtures and deterministic scoring. It checks whether useful context survives between sessions, whether superseded facts replace stale ones, and whether forgetting actually removes what should no longer be recalled.',
          ],
          /*
           * The architecture register sits inside the evaluation path rather than in the
           * orientation layer, which is the whole point of the reordering: a reader who
           * asked how memory was tested has earned the vocabulary, and a reader who did
           * not never has to parse it.
           */
          note: 'TypeScript / Node.js · PostgreSQL + pgvector · working / episodic / semantic memory · model-assisted distillation · MCP · forgetting / supersession',
        },
      ],
    },

    repositoryIntelligence: {
      heading:
        'Does giving an agent more repository evidence actually improve its decision?',
      body: 'I started by making repository context portable: a committed specification, a producer, and agent integrations. That solved an access problem. It did not answer the harder question of whether the added information deserved credit for a better decision.',
      secondBeat:
        'The work has increasingly become an evaluation problem: establish a competent no-context baseline first, then ask whether the added repository evidence changes the decision for a reason the experiment can actually attribute.',
      paths: [
        {
          id: 'baseline',
          invitation: 'Why isn’t more context automatically better?',
          label: 'WHAT CHANGED THE QUESTION',
          paragraphs: [
            'An early demonstration correlated repository history with the desired conclusion without proving that the omitted relationship caused the failure. I rebuilt the fixture and narrowed the claim.',
            'If the baseline already makes the right decision, retrieval cannot be credited for causing it. Baseline competence is an invalidation condition, not an inconvenience.',
            'The current question is not “can I retrieve useful-looking facts?” It is “which decision-time repository facts survive a competent baseline and causally change an agent decision?”',
          ],
          note: 'The contract and the integrations are public and implemented. The causal question is active research and is still being characterised; no result is claimed here that a public artifact does not carry.',
        },
        {
          id: 'path',
          invitation: 'Walk the repository-to-agent path',
          label: 'STANDARD → CODEX → TALLY',
        },
      ],
    },

    interlock: {
      heading: 'Two agents can each be right and still be wrong together.',
      body: 'Two actions can be individually valid and still violate a shared constraint when they happen together. Interlock asks whether current environment evidence can make that coordination decision before either mutation lands.',
      secondBeat:
        'The important test was not whether the UI could display evidence next to a decision. The decision had to change when the evidence changed, and the protected action had to reject a path that bypassed the coordination receipt.',
      paths: [
        {
          id: 'proof',
          invitation: 'Walk the coordination proof',
          label: 'THE COORDINATION PROOF',
          paragraphs: [
            'Problem: two locally valid intents share one bounded environment constraint.',
            'Counterfactual: compare uncoordinated execution with evidence-bound coordination under the same task structure.',
            'Load-bearing evidence: perturb the environment evidence. The coordination decision must change with it.',
            'Load-bearing receipt: attempt the protected mutation without the required receipt. The target must reject it.',
            'Observed outcome: EXECUTED and independently authenticated OBSERVED stay separate facts.',
          ],
        },
        {
          id: 'limits',
          invitation: 'See what the experiment refuses to claim',
          label: 'WHERE THE EVIDENCE STOPS',
          paragraphs: [
            'The controlled counterfactual ran locally. The Google Cloud traversal is a separate recorded run. Neither proves the other.',
            'The result is not a universal safety proof, not a fleet-scale concurrency guarantee, and not evidence about behaviour outside the stated constraint and environment.',
            'Negative findings stay visible. A bounded system is stronger when the reader can see where the evidence stops.',
          ],
        },
      ],
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
