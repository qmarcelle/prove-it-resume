# Performance

Assumptions, measurements, and the decisions behind them. The goal is an artifact that
feels immediate to an evaluator opening one link, not a benchmark score.

## Measured

Production build (`pnpm build`), served by `pnpm start`, loaded in headless Chromium at
1280×720 over localhost. Localhost removes network latency, so treat transfer sizes and
request counts as the meaningful numbers here and timings as not meaningful.

| Metric                        | Value                                  |
| ----------------------------- | -------------------------------------- |
| Requests, full page load      | 14                                     |
| Transferred, total            | 265.7 KB                               |
| Document (HTML)               | 48.3 KB transferred / 279.6 KB decoded |
| Scripts                       | 147.9 KB transferred                   |
| CSS + fonts                   | 69.5 KB transferred                    |
| Cumulative Layout Shift       | 0.0000                                 |
| Largest Contentful Paint      | the `<h1>`                             |
| Routes rendered at build time | all of them                            |

The earlier figures in this table (231 KB total, 139.9 KB scripts, 130.9 KB decoded) were
measured at `d494a52` and had gone stale: three design commits and the résumé completion
state landed between then and the icon work, and the table was not re-run. Recording that
rather than quietly overwriting it, because a budget nobody re-measures is not a budget.

The icon set, the concept marks, and the hero composition were measured against the build
immediately before them (`7fc832d`), in a worktree, so the delta is attributable:

| Metric             | Before   | After    | Delta   |
| ------------------ | -------- | -------- | ------- |
| Requests           | 14       | 14       | 0       |
| Transferred, total | 257.8 KB | 264.9 KB | +7.0 KB |
| Document           | 44.4 KB  | 47.9 KB  | +3.5 KB |
| Scripts            | 144.8 KB | 147.6 KB | +2.8 KB |
| CSS + fonts        | 68.7 KB  | 69.4 KB  | +0.7 KB |

The document grows 52.3 KB decoded for 3.5 KB on the wire, because repeated SVG path data
compresses almost completely. Icons are server-rendered markup, so they land in the
document figure; a jump in the script figure would mean something became a client
component by accident.

The document is comparatively large and the JavaScript comparatively small, which is the
intended shape: the evidence is in the HTML, and the JavaScript only powers the
disclosures and the proof rail.

Reproduce with any of: `pnpm build && pnpm start`, then Lighthouse or DevTools; or read
the per-route table `next build` prints.

## Decisions

**Everything is static.** `/`, `/role/athenahealth-yoh`, `/robots.txt`, `/sitemap.xml`,
and the 404 all prerender at build time. There is no server work per request, no
database, and no runtime data fetching, because the content is a versioned artifact in
the repository.

**Server Components by default.** `"use client"` appears in fourteen files, all of them
genuinely interactive; `docs/implementation-notes.md` lists each with the reason. Every
proof section, evidence row, boundary, icon, concept mark, and piece of copy renders on
the server. Notably the hero composition does too: `BoundedField` is a client component
only so that it can rewind and play its beats, and the frame it renders on the server is
the finished one. See ADR 0004.

**Fonts are self-hosted through `next/font`.** The design export loaded Public Sans and
JetBrains Mono from a Google Fonts `<link>`, which is a render-blocking third-party
stylesheet plus two extra connections. `next/font` inlines the face declarations and
serves the files from the same origin, with `display: swap`. Measured CLS is 0.0000.

**No animation library.** No Motion, no Three.js, no Lottie, no Rive.

The hero composition tested that rule rather than sitting outside it. It arrived as a
prototype for a `.lottie` asset, and it ships as CSS transitions keyed off a `data-beat`
attribute — the export's own recommendation was to deploy the prototype and defer buying
a runtime until the concept had been in front of real readers. The trigger for revisiting
that, and the nine constraints any asset would have to meet, are in
`docs/decisions/0009-a-fourth-animated-treatment.md`. The only motion in
the application is a handful of CSS colour transitions on hover and the browser's own
smooth scrolling, which is disabled under `prefers-reduced-motion`. A runtime for
animation that explains nothing would be pure cost.

**No third-party scripts and no analytics.** Nothing is loaded from another origin, so
there is no third-party JavaScript, no tracking, and no consent surface to build.

**No images, and the icons are not one.** There is still no image pipeline and nothing to
lazy load. The fifteen action icons and three concept marks are inline SVG rendered on the
server: no request, no decode, no `next/image`, and no chance of arriving after layout.
Each carries explicit `width` and `height` attributes, so its box exists before any
stylesheet resolves — which is the same reason the status glyphs are fixed-size spans.

If a raster image is ever added, it goes through `next/image` with explicit dimensions.

**Decorative content cannot shift layout.** Status glyphs are fixed-size spans, the
architecture connectors are text in flow, and there is nothing absolutely positioned that
loads late. Disclosures add content below the fold on click, which is a user-initiated
change rather than a layout shift.

## Known costs

- **The framework runtime dominates the JavaScript budget.** ~140 KB transferred is
  mostly React and the Next.js client runtime, not application code. Reducing it further
  would mean leaving the framework, which is not a trade worth making for a site that
  demonstrates React architecture.
- **The document is larger than a marketing page's.** That is the design: the evidence,
  the drawer contents, and every boundary are in the HTML so they are present without
  JavaScript, searchable in-page, and readable by a crawler.
- **Both role routes are prerendered.** With a handful of lenses this is free. If lenses
  ever numbered in the hundreds, `generateStaticParams` would need revisiting — but that
  would also mean the artifact had become something else.

## Not measured

Real-world Core Web Vitals under field conditions. There is no analytics and no RUM, by
decision. Once a canonical domain exists, a one-off Lighthouse run against the deployed
URL is the cheapest useful check.
