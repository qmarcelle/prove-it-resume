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

---

## Requires evidence link

The claim is supported by supplied copy, but no exact inspectable artifact was given.
Each renders `VERIFY BEFORE PUBLISHING` in place of a call to action.

In the export these pointed either at `#sec-0N` — the section the reader is already in —
or at the general GitHub profile. Neither is the artifact the row names.

**Vreko** (`EV-VRK`) — 0 of 8 resolved

- Vreko MCP Server repository
- Architecture: transport → MCP protocol → intelligence layer
- Agent lifecycle: brief → pulse → learn → end
- Local + hosted execution paths

**Repository Intelligence** (`EV-WSJ`) — 2 of 12 resolved (both the Tally case)

- Canonical `workspace.json` specification (Apache-2.0)
- JSON Schema / types
- CLI / producer tooling
- `workspace.json` for Codex — agent-side hooks and repository history
- Integrations
- Decision-time information study

**Interlock** (`EV-ILK`) — 0 of 8 resolved

- Controlled counterfactual comparison
- Frozen evidence packet
- Independent verifier
- Cloud traversal: Google ADK + Vertex AI + Cloud Run + MCP proxy

**Supporting**

- Never Ask Twice ablation
- "Selected Marcelle Labs work" — currently the GitHub profile; should become a specific
  destination.

---

## Requires factual verification

Values that should not ship publicly until checked against reality.

| Item                                                                              | Where                         | Concern                                                                                                                                                                             |
| --------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Interlock counterfactual figures — `140 > 130`, `WITHHOLD_SERIALIZE`, `120 ≤ 130` | `content/proofs/interlock.ts` | Carried over from the design prototype and **labelled in the UI as prototype values**. They are not bound to a published evidence packet. Publish the packet or remove the figures. |
| `~10 YEARS` enterprise healthcare                                                 | `content/site.ts`             | From the export. Confirm against the actual record before publishing.                                                                                                               |
| `REV 2026.08`                                                                     | `content/site.ts`             | A static string from the export. Decide whether it should be a build stamp.                                                                                                         |
| `AVAILABLE FOR STAFF / PRINCIPAL AI PLATFORM WORK`                                | `content/site.ts`             | Confirm this is currently true before it goes live.                                                                                                                                 |
| `Steward, workspace.json`                                                         | `content/site.ts`             | Confirm the stewardship framing is accurate and current.                                                                                                                            |

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
| **Repository decision diff data**     | No plan pair exists in the export.                                                                                                                 | Pass a `RepositoryDecisionDiffData` to `<RepositoryDecisionDiff>` in the Repository Intelligence section. Layout, state machine, and accessibility are done.                                                                                                                                                              |
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
