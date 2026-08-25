import type { DecisionReceipt } from '@/lib/types';

/**
 * Decision Receipts.
 *
 * The design export listed these seven as selectable checkboxes with a "N selected"
 * counter — it collected intent and returned nothing. Here each is a receipt an
 * evaluator can open.
 *
 * Each receipt is reconstructed from a recorded decision, not written for this page.
 * The sources are the Linear issues and Fibery Open Questions that carried the
 * reasoning at the time it was made: constraint, alternatives, disposition, measured
 * outcome. Where a decision produced a public, revision-pinned artifact, `evidence`
 * links to it. Where the record is private — internal Linear issues, an unpublished
 * repository — no evidence row is claimed, because a row an evaluator cannot open is
 * not evidence. Issue identifiers appear in the prose as provenance, not as links.
 *
 * The rule that governs this file: nothing here may be inferred. A receipt states what
 * was decided and what was measured, including where the measurement refused to support
 * the thesis. Fabricating architectural rationale is the exact failure mode this site
 * argues against.
 */
export const DECISION_RECEIPTS: readonly DecisionReceipt[] = [
  {
    id: 'dr-mcp',
    question: 'Why MCP instead of another integration surface?',
    constraint:
      'Repository intelligence had to reach a coding host — Codex first, then Claude Code — without polluting its context, without write access, and without the host repository taking a dependency on a private daemon. Two surfaces could carry it: an MCP server, or a repo-native CLI the agent shells out to.',
    alternatives: [
      'A repo-native CLI invoked through Bash. No typed inputs, no schema validation, and a trace span whose input is an opaque string.',
      'The wider five-tool MCP surface from the original research proposal, including explain_workspace_signal and refresh_workspace.',
      'Delegating server construction and lifecycle to the provider SDKs rather than owning an MCP server first-party.',
    ],
    decision:
      'MCP, deliberately narrow: four read-only tools — file context, co-change partners, fragile files, and a changeset-level assessment — with the repo-native CLI retained as a fallback that works without MCP at all. MCP was chosen because it is a governed surface: typed inputs, schema validation, first-class spans. A CLI-with-a-token trades context tokens for attribution fidelity. explain_workspace_signal was cut as bloat and refresh_workspace was cut because the window is read-only by design.',
    tradeoff:
      'MCP costs a standing context tax — tool descriptions are re-sent on every dispatch, and that tax was asserted rather than measured. A later experiment found a worse failure mode: a listed tool is not necessarily an available one. The adapter was schema-deferred behind tool search in every run — name visible, parameter schema never loaded — and was invoked in 0 of 21 connected runs, including nine told outright that repository-history context was available. Directed probes settled it: 4/4 runs under default configuration required a schema-retrieval call first; 3/3 with alwaysLoad invoked the tool directly. The surface can be present, correct, well-formed, and still never reached.',
    evidence: [
      {
        id: 'dr-mcp-e1',
        kind: 'experiment',
        title: 'META-363 — MCP adapter delivery null, evidence tree pinned at a7d2f78',
        description:
          'The 30-run adapter experiment whose null was later reclassified: not a verdict on the evidence, a verdict on an instrument that could not deliver its own treatment.',
        href: 'https://github.com/workspacejson/integrations/tree/a7d2f7880e8b581d9c47adf30b51ac2b9b862344/docs/evidence/meta-363',
        verified: true,
      },
    ],
    wouldChangeIf:
      'The open rebaseline (META-324) is the trigger. The provider and MCP SDKs have moved since this was decided — if they now own server construction, lifecycle, transport, and approval flows, the first-party server is code to delete rather than defend. Moving the other way, to a CLI on token-cost grounds, requires the tool-description tax as a number first. It has never been measured, and an unmeasured cost is not a reason.',
  },
  {
    id: 'dr-state',
    question: 'Where should agent state live?',
    constraint:
      'Agent sessions do not survive their own runtime. Context compaction and session restart destroy in-progress state — current phase, spec path, completed steps — and a daemon restart orphans an active session outright when session identifiers are process-scoped. The observed failure was worse than a lost session: the tool returned a session ID, then three separate calls all reported no active session, while the durable event log had already recorded the session as started.',
    alternatives: [
      'In-memory only. Fastest, and the state is gone at the first process boundary — this is what shipped, and what broke.',
      'Park state to a side file with a TTL, claimed by the next session.',
      'Rehydrate the current session from the durable event log on lookup, so the log is the single source of truth.',
    ],
    decision:
      'State that must outlive a process does not live in the process. Swarm parks it to a side file under .ai-swarm/state/ with a five-minute TTL — park, claim, clear — and fails open, so a park or claim failure never throws. The daemon fix is the other pattern: persist or rehydrate the current session from history so the session lookup answers across calls and restarts, and derive the session ordinal from history rather than reporting a fabricated one. Generated and runtime state renders into .ai-swarm/**; authored engine sources stay separate from it.',
    tradeoff:
      'Fail-open means a lost park degrades silently — the next session starts over instead of erroring, so the failure presents as ordinary slowness rather than as a fault. A TTL side file is also not a real subprocess seam: it is a partial mitigation for the channel-0 context-propagation gap ranked third in the capability-scoring table, and it does not close it. And the storage half shipped without the protocol half. Across fourteen agent templates, a grep for compact, resume, restart, recover, checkpoint, or interrupt returned one false positive: no template tells an agent how to recover, so parked state can sit unclaimed by a session that does not know to look.',
    wouldChangeIf:
      'Close the channel-0 gap with a genuine subprocess-aware boundary and the TTL side file becomes redundant scaffolding to delete. Ship the resume protocol and the mechanism gets its missing half. Leave the protocol unshipped and the storage is theatre — state that is durably written and never read.',
  },
  {
    id: 'dr-mandatory',
    question: 'When should a tool call be mandatory versus discretionary?',
    constraint:
      'The specs on disk consistently implemented enforcement as a prompt amendment asking the agent to run a script the same spec had just created. The deterministic half was written; the invocation was left to agent memory. That is discipline-dependent enforcement, and it fails in the direction where nothing complains — an agent that forgets the check produces a clean report, and nothing distinguishes no breach from never checked.',
    alternatives: [
      'Leave the invocation in the prompt and rely on the agent to remember. Cheap to write, and structurally indistinguishable from not checking.',
      'Expose every check as an agent tool. Rejected: a declined gate is indistinguishable from a passed gate.',
      'Move every imperative to CI. Impossible for anything that needs live session state, which CI does not have.',
    ],
    decision:
      'Classify every imperative into one of four buckets by a single placement question — can this be checked from bytes in git? Yes goes to CI, where it fires on the agent and cannot be skipped. No but still deterministic goes to a session hook. Skipping degrades the output without falsifying it: afford, a script-as-tool the agent may decline. Requires reasoning: judgment, and it stays in the prompt. The producer/validator split is invariant across all four — an agent may emit a verdict, a confidence, a retrospective. Validating that emission is always a script. The agent is never trusted to check its own output.',
    tradeoff:
      'The classification is only as good as its enforcement surface, and the enforcement surface has holes. CI sees only tracked files, so any verification command aimed at untracked agent state is structurally unrunnable and therefore structurally green — a gate that cannot fail. Session hooks have their own gap: a file-tool guard covers file tools and is bypassable through the shell, which makes it advisory rather than enforcing, and it has to be documented as advisory or it reads as a gate too. Separately, an audit found four enforcement scripts with zero template call-sites and a completion gate that was either always-zero noise or a guaranteed violation. Writing the script is the cheap half; the invocation is the enforcement.',
    wouldChangeIf:
      'A demoted imperative moves back to the prompt when it turns out to need reasoning that a script cannot carry. The reverse is more common and more urgent: any row whose bucket is enforce and whose current form is prompt is a finding, not an annotation. Every prompt paragraph deleted is a permanent reduction in the cacheable prefix on every dispatch of that role — a script is a one-time write and a free invocation, while a prompt amendment is a standing tax.',
  },
  {
    id: 'dr-causality',
    question: 'How do you know repository context actually affected a decision?',
    constraint:
      'A treatment arm that looks better than baseline proves nothing on its own. Better prose, a higher score, or a generic warning are all things a model will produce from a longer prompt regardless of whether the added evidence was load-bearing. The claim under test was narrow and falsifiable: that descriptive repository evidence makes an existing workflow notice a material, repository-specific consequence it otherwise misses — without the evidence owning the workflow behaviour.',
    alternatives: [
      'Baseline versus treatment alone. Cannot separate the evidence from the extra tokens carrying it.',
      'An LLM judge scoring the two outputs. Substitutes one unverified judgement for another.',
      'Three arms, with a perturbation control that changes the evidence and holds everything else fixed.',
    ],
    decision:
      'Three arms, always. Baseline without the evidence, treatment with it, and a perturbation arm where the repository history is deliberately altered so the relevant evidence materially changes or disappears — same task, same workflow, same decision code. A finding counts only if it is material, baseline misses it, treatment reaches it because of the evidence, and it correspondingly changes or disappears under perturbation. If the result does not move with the evidence, the evidence is decorative rather than load-bearing. Missing, stale, refused, or malformed evidence is recorded as explicit uncertainty and never as safety.',
    tradeoff:
      'The method is expensive and it disqualifies most of its own results. In the causal review experiment the design held: 3/3 in treatment, 0/3 in baseline, 0/3 under perturbation, with the consequence independently confirmed against repository source. It held in one fixture of three, and the reviewer there had no filesystem access — it received a partner path it could not open. So evidence changed the investigation set is proven; the reviewer autonomously inspected and verified is not. The proposed explanations for the two failures remain hypotheses, and are recorded as hypotheses rather than as boundary conditions.',
    evidence: [
      {
        id: 'dr-causality-e1',
        kind: 'experiment',
        title: 'META-362 — three-arm causal review evidence, pinned at a034339',
        description:
          'Baseline, treatment, and perturbation receipts for the M2A scenarios, including the negative and ambiguous findings.',
        href: 'https://github.com/workspacejson/standard/tree/a034339ddb3a0482ede258cb57cef828c15e26eb/docs/evidence/meta-362',
        verified: true,
      },
      {
        id: 'dr-causality-e2',
        kind: 'experiment',
        title: 'HAC-330 — S-1 concept gate evidence packet',
        description:
          'The prior perturbation-controlled proof: green change A plus green change B produce a red joint state, and the decision changes because mined co-change evidence changes.',
        href: 'https://github.com/Marcelle-Labs/interlock/pull/5',
        verified: true,
      },
    ],
    wouldChangeIf:
      'A cheaper control that separates the evidence from the tokens carrying it would replace the perturbation arm. Nothing has. The sharper open question is upstream of the method: whether a filesystem-capable host has any headroom to close at all. A bounded search for a review fixture with measurable headroom found none — the baseline stated the registered consequence in 5/5 runs and cited the registered partner path in 5/5, in four to eight tool calls, where admission required 0/5.',
  },
  {
    id: 'dr-cicd',
    question: 'How would you introduce one agent into an existing CI/CD workflow?',
    constraint:
      'An asynchronous review agent had been running advisorily while the tests were required. A pull request merged before the agent finished, and two valid P1 findings arrived about two minutes after the merge. Requiring conversation resolution would not have prevented it, because no review conversations existed yet at merge time. Review completion itself had to become a required status gate.',
    alternatives: [
      'Leave the agent advisory. Keeps merges fast and lets valid findings land after the merge, which is what happened.',
      'Configure it in the vendor dashboard. Works, and leaves the review behaviour unversioned and unreviewable.',
      'Commit a repo-owned policy, calibrate it on a disposable canary, and only then promote the check to required.',
      'Copy the proven policy into the sibling repositories wholesale.',
    ],
    decision:
      "A staged rollout, per repository, in a fixed order. Commit the review policy into the repository so it is versioned and can govern the pull request that introduces it. Run a disposable canary that proves five things before any branch protection changes: that branch-local configuration is read, that the check is bound to the current head, that a deliberate reversible violation is caught, that the reverted head does not repeat the finding, and that a new push retriggers review. Only then promote the check to required. Do not copy semantic rules between repositories with different responsibilities — carry the rollout pattern across, and re-derive the rule vocabulary from each repository's own verified failure modes. Absence of evidence is not a rule justification.",
    tradeoff:
      'A required check is a single point of failure, and this one failed. The check was promoted to required on the strength of it firing on two pull requests, and it stopped firing immediately afterwards. Every merge to that repository was blocked: the agent was running and posting reviews, but emitting no status check, across three separate heads with zero unresolved conversations and every other check green. The documented recovery — push again and the check re-fires against the new head — was tested twice and did not hold. The same configuration value produced the check in the sibling repository and not in this one. The gate had no way to be satisfied by anything, and it blocked unrelated work including hotfixes until an admin either fixed the emission or removed the requirement.',
    evidence: [
      {
        id: 'dr-cicd-e1',
        kind: 'source',
        title: 'Repo-owned review policy and merge-policy docs (PR #10)',
        description:
          'The policy committed into the repository it governs, rather than configured in a vendor dashboard.',
        href: 'https://github.com/workspacejson/integrations/pull/10',
        verified: true,
      },
      {
        id: 'dr-cicd-e2',
        kind: 'observed',
        title: 'Calibration canary, closed unmerged (PR #11)',
        description:
          'The deliberate positive-control violation, its catch, the reverted clean head, and the retrigger proof.',
        href: 'https://github.com/workspacejson/integrations/pull/11',
        verified: true,
      },
      {
        id: 'dr-cicd-e3',
        kind: 'specification',
        title: 'Merge policy — the operator rule the gate does not enforce',
        description:
          'A green test suite is not merge authorisation; fetch unresolved threads and required-check state immediately before merging.',
        href: 'https://github.com/workspacejson/integrations/blob/129017794e6ea8e41a843c384b05cc30358772d4/docs/review/merge-policy.md',
        verified: true,
      },
    ],
    wouldChangeIf:
      'A required check whose emission cannot be observed on demand should not be required — the calibration process would have caught that before promotion, and it was promoted on two observations instead. The rule that came out of it is the one worth carrying: verify the check fires on the current head as a precondition of requiring it, and keep the removal path an explicit, non-silent admin decision, because dropping it removes a review gate that was added deliberately.',
  },
  {
    id: 'dr-kill',
    question: 'What would make you kill an AI-platform experiment?',
    constraint:
      'A kill rule written after the results are visible is not a kill rule. The failure mode being defended against is optimism after the stated kill condition — continuing because the remaining gap looks like one more bounded assembly, when the assumption that made it bounded has already been falsified.',
    alternatives: [
      'Judge each experiment on its results as they arrive. Invites redefining the threshold once a favourable case appears.',
      'Freeze the protocol, taxonomy, corpus, baseline, and kill rules before any evidence is reviewed.',
      'Set a deadline instead of a criterion. Stops the work without telling you what was learned.',
    ],
    decision:
      'Freeze the kill rule before the evidence, in writing, as an admission contract — so the problem, corpus, baseline, and success threshold cannot be redefined after seeing a favourable case. Then honour it. The rules are stated as observable conditions, not judgements: the intended failure does not reliably reproduce; the evidence has to be manually invented to make treatment work; perturbing the source does not perturb the evidence; the decision does not actually depend on that evidence; treatment only works by bypassing the frozen contract. If three deliberately selected scenarios cannot produce a clean causal delta, stop — do not add schema, scoring, orchestration, dashboards, or integrations to rescue the thesis.',
    tradeoff:
      'Honouring it costs real work. One experiment was killed after five adversarial checkpoint rounds, with six independent structural reasons recorded: no authenticated path from the deployed agent to the ingress, no executable deployment entrypoint behind the manifests, no remote evidence-retrieval path, an identity resolution that could label a caller-controlled header as platform-verified, a target audience rendered once for two independently authenticated targets, and a preflight that populated its own expectations instead of requiring the deployed observation to carry them. The recurring pattern was that local tests certified a topology different from the one provisioning would actually render. The controlled local result stayed valid at its own level and was explicitly not described as having executed on the platform it failed to reach.',
    wouldChangeIf:
      'A kill fires once, on its stated condition, and the successor gate has to be smaller and independently truthful rather than a rescue of the same spike. What does not change the decision: a sparse result, a negative result, or a repository whose evidence abstains. Those are outcomes, not grounds for replacement — no disposition may be rescued with substitute cases or post-outcome tuning.',
  },
  {
    id: 'dr-negative',
    question: 'What did your experiments fail to prove?',
    constraint:
      'A preregistered experiment can only report what its frozen arithmetic supports. Three separate lines of work were run to falsify claims that would have been convenient, and all three declined to support them.',
    decision:
      'Record the negatives at full strength and let them narrow the thesis. First: a historical co-change signal did not replicate out of sample. On five previously unseen TypeScript repositories, preregistered before selection and before any outcome was read, the diagnostic residual of +0.0635 became two material negatives (−0.1584 and −0.1061) and one neutral (+0.0257); zero repositories cleared the positive gate, and the frozen ladder terminated at insufficient replication support. Two further repositories failed the static-baseline validity rule, were reported in full, and counted as evidence in neither direction. Second: the review-value question remains open after two experiments, and a bounded search for a fixture with any headroom to close found none. Third: an adapter experiment returned a null that was later withdrawn as a result — the instrument could not deliver its own treatment, so it was not an answer in either direction.',
    tradeoff:
      'What survives is narrower than what was hoped for. Source-conditioned co-update history beats source-independent test popularity decisively where the candidate suite is large — +0.6086 and +0.4650 — but it does not beat a native static dependency baseline built from the same tree with no history at all. Two of three informative repositories favour the static baseline materially; the third is an exact paired split, 23 wins to 23 losses with 66 ties. The question is therefore no longer whether history carries signal but whether the signal is anything beyond static structure already visible in the current tree, and on this evidence the current-tree explanation is the better-supported one.',
    evidence: [
      {
        id: 'dr-negative-e1',
        kind: 'experiment',
        title: 'META-380 — out-of-sample replication, pinned at e379b31',
        description:
          'Preregistration, universe and selection receipts, per-repository deltas, and the terminal disposition. 15/15 invariants pass; 12/12 deliberate red tests pass and are proven non-inert.',
        href: 'https://github.com/workspacejson/cli/tree/e379b31be4b45f241b7a2a1dcaf718a45ecc4441/docs/evidence/meta-380',
        verified: true,
      },
      {
        id: 'dr-negative-e2',
        kind: 'research',
        title: 'META-373 — bounded headroom search, pinned at 9fa8f22',
        description:
          'Five deep-screened candidate relationships from 150 registered pairs. Four rejected on structure; the one measured had a baseline that stated the consequence 5/5 where admission required 0/5.',
        href: 'https://github.com/workspacejson/integrations/tree/9fa8f226cf7aa3918a2734eb8a90ec99b31e0eda/docs/evidence/meta-373',
        verified: true,
      },
    ],
    wouldChangeIf:
      'The negatives are bounded, and are stated as bounded rather than as impossibility. The replication measured observational later co-touch signal and establishes nothing about dependency, coverage, required tests, regression-catching capability, risk, or which files an agent should edit. The headroom search examined a capped selection of a much larger qualifying population, and four of its five rejections were structural — which shows only that those candidates were obviously bridged. Reopening either requires a naturally occurring case with measured baseline headroom, not a re-run with kinder fixtures.',
  },
] as const;

/** The receipt's shape, shown even when unanswered so the format is inspectable. */
export const RECEIPT_SECTIONS = [
  'CONSTRAINT',
  'ALTERNATIVES CONSIDERED',
  'DECISION',
  'FAILURE MODE / TRADEOFF',
  'EVIDENCE',
  'WHAT WOULD CHANGE THE DECISION NOW',
] as const;
