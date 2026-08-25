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
| `Prove It Resume - Hero Concept B.dc.html` | Fourth import. "The Bounded Field" — a hero sequence prototype, and the geometry the concept-mark vocabulary is cropped from. Retrieved from the Claude Design project rather than a download bundle, so the hash below is of the file as committed here. |
| `support.js` | Claude Design viewer runtime. Reference only. |
| `thumbnail.webp` | Export preview image. Reference only. |

## SHA-256

```
edd40d1d4cbac78b9d1a22556834e5909ead07b3fcdf483edbe84f31ff83a5a3  Prove It Resume - Hero Concept B.dc.html
73052f8a63f211ce549fb205c62254100666d02ceb19e39b535c8338e1b90380  Prove It Resume - Redesign.dc.html
843bdbac8670f3bca3b32fe4b314ac498da208b98c2367d8f05bb3299e76815f  Prove It Resume - Visual Directions.dc.html
e8fe55189bbeeb8563c6cf4ab894de7b88f22210fd90070f16ac96a2dceba5e0  Prove It Resume.dc.html
8fe7df74405f3c55f49b7249c74ea1397e65d07dea2b1bd3b4a489bec2e28cbe  support.js
1d2afd05db13a2dbf3a3c51d4ac1f38b6d0767d303b9e9485ed9f977edcffead  thumbnail.webp
```

Verify with `shasum -a 256 design/reference/claude/*`.

See `docs/design-import.md` for what was extracted from these files and where each
piece landed in the application.
