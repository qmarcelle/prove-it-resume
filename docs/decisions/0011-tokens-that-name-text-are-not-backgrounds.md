# 0011: A token that names text is never a background

**Status:** accepted

## Problem

The Interlock verdict chip rendered as a blank amber-free rectangle on `/linear`. `✓
CONSTRAINT HELD` was in the DOM the whole time, painted on itself.

The rule behind it:

```css
.verdictHolds {
  background: var(--color-ink);
  color: var(--color-inverse-ink);
}
```

Two independent assumptions are encoded there: that ink is dark, and that inverse ink
is light. Both are true on the durable page. `LensSurface.module.css` remaps `--color-*`
at the composition root so every component inverts without knowing it, and on that
surface `--color-ink` _is_ the light step. Fill and label resolved to `#f0ede6` each.

Nothing caught it. TypeScript sees two strings. Prettier and ESLint see valid CSS. Axe
reads the colours declared on the element, not the pairing the custom properties resolve
to. Every unit test passed, every e2e test passed, and the class name in the DOM was
correct. The only detector was a person looking at the page.

This is the second time the same mistake shipped. `--color-action-fill` /
`--color-action-ink` exists because three filled buttons made the identical assumption
during the first Lit Work Surface pass. Fixing it once, in one place, did not generalise,
which is what makes it a rule rather than a bug.

## Alternatives

1. **Set the chip's colours literally.** `color: #121110`. Fixes the screenshot, leaves
   the class of defect intact, and adds a hard-coded value to a codebase whose entire
   colour story is the token layer.
2. **Give the lens a `.verdictHolds` override.** A parallel dark rule per component,
   which is the arrangement `LensSurface.module.css` was written specifically to avoid.
   It also only works for components that already exist.
3. **Name the pair, and make the rule enforceable.** More tokens, and a check that has
   to be maintained.

## Decision

Option 3, in two parts.

**The pair.** `--color-verdict-held-{bg,fg}` and
`--color-verdict-breached-{bg,fg,border}`, alongside the existing `--color-action-*`
trio. The default palette resolves them to exactly the values those rules resolved to
before. The lens answers with an amber chip at 8.7:1, which is also the correct reading
of the direction: a held constraint is the one place on that page a measurement is
reported as having survived, and amber is what this surface spends on verified.

**The rule.**

> A token that names text is not a background. A fill pairs with a _ground_ token
> (> `--color-canvas`, `--color-surface*`, `--color-inverse-bg`) which inverts alongside
> it, or with a purpose-named `{bg,fg}` pair that a surface has to answer deliberately.
> It never pairs with a second ink token.

Filling with an ink token remains legitimate on its own. `--color-ink` behind
`--color-canvas` text is a solid chip that survives inversion, because the ground token
moves with the palette. It is the ink-on-ink pairing that is unsound, and the audit
that produced this rule found exactly one instance of it in the codebase.

## Consequences

- `src/styles/token-polarity.test.ts` scans every CSS module, block by block, and fails
  the build on an ink fill behind ink text. It is structural, so it holds for palettes
  that do not exist yet. It was verified against the original defect before being
  committed: reintroducing the two lines makes it fail and names the file and selector.
- `tests/e2e/interactions.spec.ts` reads the _resolved_ colours off the served page for
  both verdict chips, on `/` and `/linear`, and does the WCAG arithmetic. A structural
  rule cannot prove legibility, and this is the half that can.
- Two checks rather than one, deliberately. The structural check catches the pattern
  before it renders; the rendered check catches a collision arriving by some route the
  pattern does not describe: a third token, an alpha composite, a future surface.
- A new surface that inverts polarity has to answer the verdict pair, the action trio,
  and anything else purpose-named, rather than inheriting a guess. That is more work at
  the moment a surface is created and less work every time afterwards.
- The audit is recorded rather than repeated: every other ink-as-fill in the codebase
  (the skip link, the pressed states in `StepControl` and `InterlockCounterfactual`, the
  final call to action, the 404 link) pairs against a ground token and survives
  inversion. They were checked, and they are correct as written.
