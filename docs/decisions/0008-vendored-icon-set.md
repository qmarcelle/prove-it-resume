# 0008: Icon geometry is vendored, and one meaning gets one icon

**Status:** accepted

## Problem

The page's affordances did not predict what they would do.

A single `↓` stood for four unrelated actions: download a file (`SiteHeader`, `Hero`,
`SiteFooter`, `FinalCta`, `ResumeBridge`), expand a disclosure (`EvidenceDisclosure`),
scroll to a section (`ProblemSection`), and the direction of dataflow inside the Vreko
diagram. `↗` stood for three different promises: inspect an exact frozen artifact
(`EvidenceLink`), visit a living profile page (the GitHub, LinkedIn, and Marcelle Labs
links), and cite a pinned artifact that is deliberately _not_ a live page
(`EvidenceSource`). Disclosure state was spelled six ways: `↓/↑`, `+/−`, `▸/▾`, `✕`,
`aria-expanded`, `aria-pressed`.

For a page whose entire argument is that evidence should be easy to retrieve at decision
time, an affordance that will not say whether it opens an artifact, saves a file, or
merely scrolls is a contradiction rather than a style.

## Alternatives

1. **Install `lucide-react`.** ~1,780 icons, upstream fixes, individual module imports
   for tree-shaking. It would be the first runtime dependency added in this project's
   history, against a line asserted in two places ("`dependencies` is still exactly
   `next`, `react`, `react-dom`") for fifteen shapes.
2. **Draw a bespoke set.** Perfectly on-grammar, no dependency, but it is real design
   work and it forfeits a vocabulary that is already coherent, already familiar, and
   already solved for optical volume at small sizes.
3. **Keep the typographic glyphs and differentiate by word alone.** Cheapest, and the
   words already differ (`INSPECT` vs `READ THE SPEC`). But it leaves the reader with
   nothing to parse before reading, which is the problem.
4. **Vendor only the shapes actually used.**

## Decision

Option 4, with a rule attached.

**The geometry.** Fifteen icons copied from `lucide-react@0.575.0` (ISC; portions derived
from Feather, MIT) by extracting each icon's published node array programmatically rather
than transcribing path data by hand, into `src/components/icon/paths.tsx`. Attribution and
the source version are in that file's header. If the set ever passes roughly thirty icons,
install the package: at that size the maintenance argument flips. It is the same posture
ADR 0007 took toward PDF libraries: reuse or reimplement the small thing, rather than take
a dependency for a fraction of what it offers.

**The rendering is not upstream's.** Lucide draws with round caps and round joins at a
constant stroke width. This page has no circles in it, a single `--radius: 2px`, and a
weight vocabulary of exactly 1px and 2px. So the icons are drawn with `stroke-linecap:
square` and `stroke-linejoin: miter`, and the stroke width is computed rather than fixed:

> Every icon's stroke renders at exactly one pixel: the same hairline as `--rule`.

The view box is 24 units and the rendered box is `size` pixels, so `strokeWidth = 24 /
size` yields a one-pixel stroke at any size (2.0 at 12px, 1.714 at 14px, 1.5 at 16px).
Holding `strokeWidth` constant instead is what makes most icon sets look heavier as they
get smaller. `Icon.test.tsx` asserts the relation at every supported size.

**One meaning, one icon: enforced by a type.** Call sites name an `Affordance`, never a
shape. `src/components/icon/semantics.ts` holds the only mapping, and
`semantics.test.ts` asserts it is injective, total, references only vendored shapes, and
vendors no shape no affordance uses. Semantic discipline stated as a convention survives
about as long as reviewer attention; stated as a test it fails the suite. This is the same
enforcement posture the evidence rules already use, where "every GitHub link is pinned to
a 40-character sha" is a test rather than a habit.

The distinction that made the set worth building is preserved inside it:
`inspect-artifact` draws a boxed arrow, `visit-external-site` a bare one, and
`pinned-citation` a locked document. Collapsing those three into one glyph would have
rebuilt the original overload in better geometry.

**Two registers, and nothing may appear in both.** A pictogram is something you can _do_;
an abstract mark is something you should _understand_. Actions use the vendored set;
concepts use `src/components/concept`, whose marks are crops of the hero composition (ADR
0009). The reader infers the split without being told.

**Marks never replace words.** Every icon is `aria-hidden` with `focusable="false"`, and
the spelled-out label stays. "Change is never colour alone" generalises: it is never
_mark_ alone either. The one icon-only control on the page, guided mode's exit, names
itself with `aria-label` as it always did.

## Consequences

- `dependencies` is still exactly `next`, `react`, `react-dom`.
- Measured against the build immediately before this change: requests unchanged at 14,
  total transferred 257.8 KB → 264.9 KB, scripts 144.8 KB → 147.6 KB, CLS still 0.0000,
  and LCP still the `<h1>`. The document grows 52.3 KB decoded but only 3.5 KB on the
  wire, because repeated path data compresses almost completely.
- Icons are server-rendered SVG. A jump in the script figure would mean something became
  a client component by accident.
- Upstream fixes do not arrive on their own. Fifteen shapes that have not changed
  materially in years is an acceptable exposure; a hundred would not be.
- Seven Playwright selectors matched button text that included a glyph and had to move in
  lockstep. Accessible names are better for it: `Walk the proof` rather than
  `Walk the proof →`.

## What this deliberately does not do

**`EvidenceStatus` keeps its three marks.** The plan for this work recommended re-cutting
them from the hero geometry so the concept vocabulary would be one system. On inspection
that is not a crop, it is new design: the derived marks are card-scale at 64×40, and
`EvidenceStatus` draws at inline-chip scale; a 4×9 bar, a 4×9 outline, a 6×6 rotated
square. Re-cutting means drawing three new chip-scale marks in this grammar, which the
export does not supply. ADR 0006 already names inventing content to fill a layout as the
worst thing this artifact could do, and the same applies to inventing geometry. The
export's fourth mark, SHIPPED, is therefore not vendored either: its only natural home is
the component that is not being touched, and a vendored shape nothing uses is dead code.

This is a real open decision, not an oversight. It should be taken with the chip-scale
geometry in hand.

**The résumé keeps its text glyphs.** `ResumeDocument` still renders `VERIFY ↗`. The PDF
is read by applicant tracking systems and by people who print it; an SVG there is a
liability, and leaving it alone means the committed PDFs and their fingerprint check are
untouched by this work.

**Diagram glyphs stay text.** Vreko's `↓` flow connectors, `▪`/`▫`, `+ − ~ =`, `✓ ✕`, and
`·` all encode state inside a diagram rather than an action, and `docs/performance.md`
names the connectors as "text in flow" for a layout-stability reason.
