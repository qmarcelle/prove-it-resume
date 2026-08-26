# 0012 — Interaction state can be a link; it is not one by default

**Status:** accepted

## Problem

`useDeepLinkedState` reflected every non-default interaction stage into the query string
with `replaceState`, so that a reader could share what they were looking at. Reading
three sections of `/linear` normally produced:

```text
/linear?interlock=evidence&layer=workspace&decision=comparison#sec-02
```

Nobody asked for that address. The reader stepped through three disclosures — which is
what the page is built to invite — and the page rewrote where they were. It reads as an
internal debug harness rather than a finished application, and the reader carries it into
their history, their bookmarks, and anything they paste, without ever having asked to
share anything.

The capability was right. The default was wrong, and the two were the same mechanism.

## Alternatives

1. **Leave it.** The URL is honest about the page's state and shareable at all times. It
   is also unshareable in practice: nobody sends a link they did not mean to construct,
   and the address is now noise in every other context it appears in.
2. **Drop the reflection entirely.** Clean URLs, and the ability to hand someone the
   exact comparison you are looking at goes with it. That capability is the most
   product-engineering thing on the page.
3. **Promote state into the path** — `/linear/interlock/evidence/…`. This over-promotes
   transient UI state into information architecture. Stages are not resources; they do
   not deserve addresses of their own, canonical tags, or a place in the sitemap.
4. **Two modes.** Browsing is clean; an explicit act produces the shareable address.

## Decision

Option 4. The abstraction changes from

> every state change **is** a deep link

to

> every state **can be represented by** a deep link.

Concretely:

- `useDeepLinkedState` publishes its value to a module registry instead of writing the
  URL. Incoming parameters are still read and applied on mount, unchanged — that half was
  never the problem.
- `CopyViewLink` — "COPY THIS VIEW" — builds the address on demand and puts it on the
  clipboard. It sits on the ordinal row of each interaction's stage control, beside the
  stage counter, because that is where the state a reader might hand on is displayed.
- It copies the **whole surface's** state, not the panel's. A reader shares what they are
  looking at, and what they are looking at is a page; a link carrying one panel's stage
  would describe something other than what the sharer sees. The anchor is the sharer's
  section; the parameters are the page's.
- One write to the URL remains, and it only ever deletes. A reader who _arrives_ at
  `?interlock=evidence` and then steps elsewhere is looking at a page the address no
  longer describes, so that one parameter is dropped. The URL moves toward clean and
  never asserts a stage the page is not in.

## Consequences

- Reload returns the resting page rather than one mid-argument, which is the correct
  reading of a reader who never asked to be anywhere else.
- The back button was already safe — `replaceState`, not `pushState` — and now there is
  nothing to be safe about. `interactions.spec.ts` asserts one press leaves the page.
- A module registry rather than a context. The three interactions are client leaves in
  separately server-rendered sections with no common client ancestor short of the page,
  and the value is only ever read at the moment of a click, so there is no subscription
  and nothing to keep in sync.
- `buildViewUrl` clears every key in `KNOWN_KEYS` before writing live state back, so a
  copied link cannot carry a stage the sharer's own page has left. That list is checked
  against the source in `deep-link.test.ts` rather than maintained by hand — a key an
  interaction used but the list omitted would survive the clearing and be handed on as a
  stale claim, silently, and only for readers who arrived through a deep link.
- Parameters this page does not own are preserved. A campaign tag on the incoming URL is
  not ours to discard.
- The clipboard can be unavailable — plain HTTP, or denied — and the control says so
  rather than appearing to work.
