# Decision records

Every architectural decision in this repository, with the alternatives that were
rejected and why. Read these when the question is _why is it like this_. The code
answers _what_ on its own.

| #                                                         | Decision                                                  | Read it when you are asking                                    |
| --------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| [0001](0001-separate-application.md)                      | Prove It Resume is a separate application                 | Why this is not a page inside another site                     |
| [0002](0002-proof-content-as-data.md)                     | Proof content is data, not page-local JSX                 | Why claims live in `src/content/` and not in components        |
| [0003](0003-role-lenses-as-projections.md)                | Role lenses are projections, not duplicated pages         | How a tailored page is prevented from authoring its own claims |
| [0004](0004-server-components-by-default.md)              | Most of the application stays Server Components           | Why so little of this ships as client JavaScript               |
| [0005](0005-design-export-as-reference.md)                | The design export is reference, not source                | Why `design/reference/` exists and is never served             |
| [0006](0006-decision-receipts.md)                         | A decision receipt, not a checkbox list                   | Why "ask me to defend a decision" opens into a record          |
| [0007](0007-resume-pdf-generated-at-build.md)             | The résumé PDF is rendered by Chromium and committed      | How the PDFs are produced and why they are in the repo         |
| [0008](0008-vendored-icon-set.md)                         | Icon geometry is vendored; one meaning gets one icon      | Why there is no icon dependency                                |
| [0009](0009-a-fourth-animated-treatment.md)               | A fourth animated treatment, in CSS, dotLottie deferred   | Why the hero is CSS and not a Lottie asset                     |
| [0010](0010-application-lenses-and-resume-projections.md) | Application lenses and résumé content projections         | What `/linear` is, and why it is not a second application      |
| [0011](0011-tokens-that-name-text-are-not-backgrounds.md) | A token that names text is never a background             | Why fills and their ink are declared as pairs                  |
| [0012](0012-state-can-be-a-link-not-is-one.md)            | Interaction state can be a link; it is not one by default | Why browsing leaves the URL alone and `COPY THIS VIEW` exists  |
| [0013](0013-mobile-recomposes-rather-than-stacks.md)      | Mobile recomposes; it does not stack                      | Why the mobile gates check meaning and not only fit            |

## Longer notes

These are not decisions; they are the working record behind them.

- [`../implementation-notes.md`](../implementation-notes.md): the defensible detail
- [`../design-import.md`](../design-import.md): what came from the design export, and every deviation
- [`../design-provenance.md`](../design-provenance.md): the uncommitted storyboard, its hash and treatment
- [`../interaction-contract.md`](../interaction-contract.md): the durable rules the storyboard produced
- [`../linear-application-surface.md`](../linear-application-surface.md): how `/linear` is composed
- [`../content-audit.md`](../content-audit.md): every unresolved content item and what it needs
- [`../performance.md`](../performance.md): measured budgets
