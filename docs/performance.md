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
| Transferred, total            | 231 KB                                 |
| Document (HTML)               | 21.9 KB transferred / 130.9 KB decoded |
| Scripts                       | 139.9 KB transferred                   |
| CSS + fonts                   | 69.1 KB transferred                    |
| Cumulative Layout Shift       | 0.0000                                 |
| Routes rendered at build time | all of them                            |

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

**Server Components by default.** `"use client"` appears in nine files, all of them
genuinely interactive: the nav provider, the rail, the guided dock, the walk-the-proof
button, the evidence disclosure, the claim ledger, the decision receipt, and the two
counterfactual interactions. Every proof section, evidence row, boundary, and piece of
copy renders on the server. See ADR 0004.

**Fonts are self-hosted through `next/font`.** The design export loaded Public Sans and
JetBrains Mono from a Google Fonts `<link>`, which is a render-blocking third-party
stylesheet plus two extra connections. `next/font` inlines the face declarations and
serves the files from the same origin, with `display: swap`. Measured CLS is 0.0000.

**No animation library.** No Motion, no Three.js, no Lottie, no Rive. The only motion in
the application is a handful of CSS colour transitions on hover and the browser's own
smooth scrolling, which is disabled under `prefers-reduced-motion`. A runtime for
animation that explains nothing would be pure cost.

**No third-party scripts and no analytics.** Nothing is loaded from another origin, so
there is no third-party JavaScript, no tracking, and no consent surface to build.

**No images.** The design has none, so there is no image pipeline and nothing to lazy
load. If one is added, it goes through `next/image` with explicit dimensions.

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
