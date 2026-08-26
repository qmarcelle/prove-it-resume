'use client';

/**
 * The page's shareable state, held apart from the URL.
 *
 * ## The distinction this exists to make
 *
 * The original arrangement was "every state change is a deep link": each interaction
 * wrote its stage into the query string as the reader stepped through it. The capability
 * was right and the default was wrong. Reading three sections of the page turned a clean
 * address into
 *
 *     /linear?interlock=evidence&layer=workspace&decision=comparison#vreko
 *
 * which reads as a debug harness rather than a finished page, and which a reader then
 * carries into their history, their bookmarks, and anything they paste.
 *
 * The rule is now: **every state can be represented by a deep link**, and only an
 * explicit act produces one. Browsing leaves `/linear` alone. `COPY THIS VIEW` builds
 * the address. Arriving through one is honoured exactly as before.
 *
 * ## Why a module registry rather than a context
 *
 * The three interactions are client leaves inside separately server-rendered sections,
 * with no common client ancestor short of the page. A provider would have to wrap the
 * whole surface to let one panel's copy control see another panel's stage, which is a
 * lot of structure for a value that is only ever read at the moment of a click.
 *
 * Nothing renders from this. It is read once, on demand, by the control the reader
 * pressed, so there is no subscription, no snapshot, and nothing to keep in sync.
 */

/** Non-default interaction state, by query key. A key at its default is never present. */
const state = new Map<string, string>();

export function publishDeepLinkState(key: string, value: string | null): void {
  if (value === null) state.delete(key);
  else state.set(key, value);
}

/**
 * The address that reproduces what the reader is currently looking at.
 *
 * Built from the live page rather than from a stored base, so it carries whichever
 * origin and path the reader actually loaded: a preview deployment included.
 *
 * Any parameter this page does not own is preserved. A campaign tag or a referrer
 * marker on the incoming URL is not ours to discard, and dropping it would make a
 * shared link quietly different from the one the sharer was given.
 */
export function buildViewUrl(anchor?: string): string {
  const url = new URL(window.location.href);

  for (const key of KNOWN_KEYS) url.searchParams.delete(key);
  for (const [key, value] of state) url.searchParams.set(key, value);

  url.hash = anchor ? `#${anchor}` : '';
  return url.toString();
}

/**
 * The keys this page owns.
 *
 * Listed rather than derived from what has mounted, because `buildViewUrl` has to clear
 * a stale parameter for an interaction that is on the page but has not registered: a
 * reader who arrives at `?decision=comparison`, scrolls only to Interlock and copies
 * from there must not hand out a link asserting a Repository Intelligence stage that
 * their own page is no longer in. `deep-link.test.ts` asserts this list matches the keys
 * the interactions actually pass to `useDeepLinkedState`.
 */
export const KNOWN_KEYS = ['decision', 'interlock', 'layer'] as const;
