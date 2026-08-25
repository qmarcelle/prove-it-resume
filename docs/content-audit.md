# Content audit

Every claim, link, and asset on the site, sorted by what would be needed to publish it
honestly. Nothing here was resolved by guessing.

Legend for the evidence model: a record is rendered as a link only when it has a
destination **and** `verified: true`. Anything else renders as a stated gap. The rule
lives in `src/lib/evidence.ts` and is enforced there rather than per component.

---

## Verified / supplied

Present in the design export and used as-is.

| Item                                                        | Where                                   | Notes                                                          |
| ----------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------- |
| Hero eyebrow, headline, supporting copy                     | `content/site.ts`                       | Verbatim from the export.                                      |
| Thesis line                                                 | `content/site.ts`                       | From the visual-directions artifact.                           |
| Availability banner                                         | `content/site.ts`                       | Export default was `showAvailability: true`.                   |
| Capability chips (6)                                        | `content/site.ts`                       | Verbatim.                                                      |
| `github.com/qmarcelle`                                      | header, hero, career, footer            | Real. Used as a **profile** link only.                         |
| `workspacejson.dev/showcase/tally`                          | Repository Intelligence                 | Real. The one verified per-artifact evidence link on the site. |
| Operating thesis + three facets                             | `content/site.ts`                       | Verbatim.                                                      |
| All three proof theses, problems, and "built"/"work" blocks | `content/proofs/*`                      | Verbatim.                                                      |
| All "what this demonstrates" lists                          | `content/proofs/*`                      | Verbatim.                                                      |
| All technology / engineering-surface tags                   | `content/proofs/*`                      | Verbatim.                                                      |
| All evidence-drawer rows and their `type` labels            | `content/proofs/*`                      | Verbatim from the export's `drawerData`.                       |
| All four proof boundaries                                   | `content/proofs/*`                      | Verbatim.                                                      |
| Claim Ledger, six rows                                      | `content/claims.ts`                     | Verbatim from `ledgerRows`.                                    |
| Role evidence map, eight rows                               | `content/roles/default.ts`              | Verbatim from `mapping`.                                       |
| Seven decision questions                                    | `content/decisions/index.ts`            | Questions only — no answers were supplied.                     |
| Never Ask Twice entry                                       | `content/supporting/never-ask-twice.ts` | Verbatim.                                                      |
| Career themes and tags                                      | `content/site.ts`                       | Theme-level, as the export specified.                          |
| `athenahealth / Yoh` lens title and organisation            | `content/roles/athenahealth-yoh.ts`     | From the export's prop defaults.                               |

### Bound during the interaction pass (2026-08-24)

What the three interactions themselves read, in `src/content/experiments/`. This is
separate from the evidence-panel rows, which are bound in `src/content/proofs/`. Every
GitHub link in both places is pinned to a full commit sha, enforced by
`src/content/experiments/experiments.test.ts`.

| Item                                     | Source                                                                            | Notes                                                                                                                                              |
| ---------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository decision diff — the whole run | `workspacejson/datahub-agent` @ `3607805f`, `evaluation/hac-152/`                 | Frozen paired-model run. Digests re-checked locally with `shasum -a 256 -c SHA256SUMS`; all three artifacts matched.                               |
| Interlock counterfactual — all figures   | `Marcelle-Labs/interlock` @ `75253e38`, `experiments/hac-330/evidence/`           | Bound, `130`, arms `140`/`120`, `WITHHOLD_SERIALIZE`, `ALLOW_PARALLEL`, coupling support 8/10, both basis revisions.                               |
| Interlock interaction data               | Same packet; HAC-343 pinned separately at `4239474a`, where its figures were read | HAC-330, HAC-340 and HAC-343 are kept as three separate results. HAC-343's judge export is not identical across the two pins, so it keeps its own. |
| Vreko interaction data                   | `vreko-dev/mcp-server` @ `c98e7ae1`, `vreko-dev/vreko-cli` @ `b096ce3b`           | Architecture, command surface and manifest. See the corrections below.                                                                             |
| Vreko public/private package split       | npm registry, checked 2026-08-24                                                  | Four packages resolve; nine declared dependencies return 404. `npm view` is published as the re-derivation.                                        |
| Decision-time information study          | `workspacejson/datahub-agent` @ `3607805f`, `evaluation/hac-152/README.md`        | Bound to one run, and labelled as one run rather than promoted to a general finding.                                                               |

### Evidence links corrected during the merge with `main`

Two defects found while reconciling with the concurrent evidence-binding commit. Both
are the same failure mode: a call to action that resolves, but not to the artifact its
row names.

| Defect                                                                                                                                          | Correction                                                                                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Interlock's "frozen evidence packet" and "independent verifier" rows pointed at `experiments/hac-342/` — the _cloud_ run's packet and verifier. | Repointed at HAC-330's own `evidence/arms.json` and `bin/verify-packet.mjs`. The rows sit directly under "controlled experiment", so opening a different experiment's packet quietly merged HAC-330 and HAC-340 — which the source repository explicitly forbids. The cloud row keeps the cloud artifacts and is labelled a separate run. |
| Vreko's agent-lifecycle row used the anchor `#the-v2-agentic-workflow`, which is not a heading in that README.                                  | Repointed at `#what-is-vreko-mcp-server`, where the lifecycle is documented. A dead anchor lands the reader at the top of the page, which reads as working evidence and is not.                                                                                                                                                           |

Every outbound link on the site was then checked with all disclosures open, across `/`
and both role lenses: **23 of 23 return 200**, and every `#anchor` corresponds to a real
heading in the target README.

### Claims corrected because the evidence said less

| Claim                                                                                               | Correction                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vreko: "Public repository containing the server implementation, tool contracts, and configuration." | Withdrawn. None of the three public repositories contain implementation source; they are distribution and documentation surfaces, and only `dist/` ships to npm.                    |
| Vreko architecture: "Transport → MCP protocol → intelligence layer"                                 | Replaced with the published decomposition, "HTTP edge → MCP protocol surface → platform". Authentication sits at the HTTP edge, not inside the intelligence layer.                  |
| Vreko boundary                                                                                      | Extended to state that the core implementation is not published, and that no accuracy figure exists for the CLI's AI-attributed change detection, which its README calls heuristic. |
| Interlock boundary                                                                                  | Extended with the packet's own negative finding: co-change evidence is a detector with false negatives, and repository-scale behaviour is explicitly not measured.                  |

---

## Requires evidence link

The claim is supported by supplied copy, but no exact inspectable artifact was given.
Each renders `VERIFY BEFORE PUBLISHING` in place of a call to action.

In the export these pointed either at `#sec-0N` — the section the reader is already in —
or at the general GitHub profile. Neither is the artifact the row names.

**This section is now empty for the three primary claims.** Every evidence row on Vreko
(`EV-VRK` 8/8), Repository Intelligence (`EV-WSJ` 12/12), Interlock (`EV-ILK` 8/8) and
Never Ask Twice (1/1) resolves to an exact artifact.

**Still unresolved**

- "Selected Marcelle Labs work" — currently the GitHub profile; should become a specific
  destination.

---

## Requires factual verification

Values that should not ship publicly until checked against reality.

| Item                                               | Where             | Concern                                                                     |
| -------------------------------------------------- | ----------------- | --------------------------------------------------------------------------- |
| `~10 YEARS` enterprise healthcare                  | `content/site.ts` | From the export. Confirm against the actual record before publishing.       |
| `REV 2026.08`                                      | `content/site.ts` | A static string from the export. Decide whether it should be a build stamp. |
| `AVAILABLE FOR STAFF / PRINCIPAL AI PLATFORM WORK` | `content/site.ts` | Confirm this is currently true before it goes live.                         |
| `Steward, workspace.json`                          | `content/site.ts` | Confirm the stewardship framing is accurate and current.                    |

---

## Missing

Not present in any supplied material. Not invented.

| Item                                  | Status                                                                                                                                             | To resolve                                                                                                                                                                                                                                                                                                                |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Résumé PDF**                        | No file supplied. Every résumé CTA in the export pointed at `#resume`; the export itself carried `[VERIFY BEFORE PUBLISHING] file + profile URLs`. | Drop the file at `public/qwynn-marcelle-resume.pdf`, then set `href` and `verified: true` on `RESUME` in `content/site.ts`. Every résumé CTA reads that one record — header, hero, bridge, footer, and final CTA all update together.                                                                                     |
| **LinkedIn URL**                      | Pointed at `#resume` in the export.                                                                                                                | Set `href` / `verified` on the `linkedin` record in `PROFILES`.                                                                                                                                                                                                                                                           |
| **Email address**                     | Pointed at `#resume` in the export.                                                                                                                | Same, on the `email` record. Consider whether a public address is wanted at all.                                                                                                                                                                                                                                          |
| **Marcelle Labs URL**                 | Pointed at `#` in the export.                                                                                                                      | Same, on the `marcelle-labs` record.                                                                                                                                                                                                                                                                                      |
| **Decision receipt answers** (7)      | Questions supplied, reasoning not.                                                                                                                 | Populate `constraint` / `alternatives` / `decision` / `tradeoff` / `evidence` / `wouldChangeIf` in `content/decisions/index.ts`. The answered branch is implemented and tested. Note that `src/content/content.test.ts` asserts receipts are unanswered — update that test deliberately when the first real answer lands. |
| **Career chronology**                 | Deliberately theme-level per the export's own note about employer confidentiality.                                                                 | This is the résumé's job, not the site's. No change recommended.                                                                                                                                                                                                                                                          |
| **Additional role lenses**            | Only the `athenahealth / Yoh` lens was supplied.                                                                                                   | Add a `RoleLens` record per role, from real material. Do not infer mappings.                                                                                                                                                                                                                                              |
| **Canonical origin / `metadataBase`** | No domain confirmed.                                                                                                                               | Set `metadataBase` in `src/app/layout.tsx` once a domain exists; the sitemap and Open Graph URLs then resolve absolutely.                                                                                                                                                                                                 |
| **Open Graph image**                  | Not created.                                                                                                                                       | Can be generated from the existing visual language using only verified content. Low priority.                                                                                                                                                                                                                             |

---

## Explicitly not done

Per the brief, and worth stating so their absence is not read as an oversight:

- No invented user counts, adoption figures, production scale, revenue, stars,
  performance numbers, cost savings, or productivity improvements.
- No invented employers, dates, or résumé chronology.
- No invented URLs, and no unresolved evidence item pointed at the GitHub profile as a
  stand-in. A test enforces both (`src/content/content.test.ts`).
- No testimonials, endorsements, or vanity metrics.
- No analytics, tracking, or third-party scripts.
