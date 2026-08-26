# Claude Design reference — provenance only

These files are the **original Claude Design export** for Prove It Resume. They are
preserved unmodified as implementation provenance: they record what the approved
design actually specified, so any later disagreement about "is that what the design
said?" can be settled by inspection rather than memory.

## These files are not production source

Nothing in this directory is imported, bundled, served, or deployed. They are not
under `public/`, so the production application never serves them.

The `.dc.html` files contain Claude Design runtime constructs — `<x-dc>`, `<sc-if>`,
`<sc-for>`, `{{ binding }}`, `style-hover`, and a `DCLogic` component class. Those are
a **behavioural and visual specification**, not a dependency. They were translated by
hand into semantic HTML, React components, TypeScript content models, and CSS Modules.
`support.js` is the Claude Design viewer runtime and has no production role.

## Files

| File | Role |
| --- | --- |
| `Prove It Resume.dc.html` | **Primary artifact.** Full-page mockup, interaction logic, and all draft copy. This is the authority for the port. |
| `Prove It Resume - Visual Directions.dc.html` | Reference only. Three explored directions plus the locked language, "Direction C·1 — Technical Review, hybridized", v0.1. |
| `Prove It Resume - Redesign.dc.html` | Third import. Partial redesign of the three proof sections and the résumé state, with its own handoff plan band. Cut at `41defda`. |
| `Prove It Resume - Hero Concept B.dc.html` | Fifth import, and the authority for the hero. "The Bounded Path" — a second pass at the hero sequence that replaces the first pass's abstract field with four labelled nodes, and the geometry the concept-mark vocabulary is cropped from. |
| `Prove It Resume - Hero Concept B (first pass).dc.html` | Superseded. "The Bounded Field", the version `docs/decisions/0009-a-fourth-animated-treatment.md` was originally written against. Kept because that record cites it, and because the second pass's stated purpose is to fix what this one got wrong. |
| `Prove It Resume - Linear Lens.dc.html` | Sixth import, and the authority for `/linear`. Four desktop frames and three mobile frames of the application lens under the "Lit Work Surface" treatment. |
| `Linear Lens - Design Spec.dc.html` | Sixth import, companion. The written specification behind those frames: the ten source ideas, the selected direction and the two discarded, the `--lens-*` token scale, component disposition, interaction, responsive, accessibility and handoff. |
| `support.js` | Claude Design viewer runtime. Reference only — it resolves `{{ }}` bindings, `<sc-for>`, `style-hover`, and the `DCLogic` base class for the viewer, and none of that survives into the port. |
| `thumbnail.webp` | Export preview image. Reference only. |

## SHA-256

The two Hero Concept B files were retrieved from the Claude Design project rather
than a download bundle, so their hashes are of the files as committed here. The two
Linear Lens files arrived in a download bundle and are hashed as supplied.

```
882829e700370c1b3e86490706304d2d7f37b517facd7eb01f372a717862040e  Linear Lens - Design Spec.dc.html
edd40d1d4cbac78b9d1a22556834e5909ead07b3fcdf483edbe84f31ff83a5a3  Prove It Resume - Hero Concept B (first pass).dc.html
4267530b9ea8be73acc1f7a93d19c4157bd2af8d4d929738dffb643dbac5419f  Prove It Resume - Hero Concept B.dc.html
32c8ad8e0acfc22d05012e2824604bd21c3291e63c852973014440c43c2d641c  Prove It Resume - Linear Lens.dc.html
73052f8a63f211ce549fb205c62254100666d02ceb19e39b535c8338e1b90380  Prove It Resume - Redesign.dc.html
843bdbac8670f3bca3b32fe4b314ac498da208b98c2367d8f05bb3299e76815f  Prove It Resume - Visual Directions.dc.html
e8fe55189bbeeb8563c6cf4ab894de7b88f22210fd90070f16ac96a2dceba5e0  Prove It Resume.dc.html
8fe7df74405f3c55f49b7249c74ea1397e65d07dea2b1bd3b4a489bec2e28cbe  support.js
1d2afd05db13a2dbf3a3c51d4ac1f38b6d0767d303b9e9485ed9f977edcffead  thumbnail.webp
```

Verify with `shasum -a 256 design/reference/claude/*`.

See `docs/design-import.md` for what was extracted from these files and where each
piece landed in the application.
