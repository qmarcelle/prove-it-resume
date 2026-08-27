'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { publishDeepLinkState } from './deep-link';

/**
 * One interaction state, which *can* be represented in the query string.
 *
 * Three constraints shape this, and they rule out `useSearchParams`:
 *
 * - **The page is statically rendered.** Reading search params during render would opt
 *   the route into dynamic rendering and force a Suspense boundary around a proof
 *   section, which is a large change to buy a shareable URL.
 * - **Hydration must match.** So the first render is always `initial`, exactly as the
 *   prerendered HTML has it, and the URL is applied in an effect afterwards.
 * - **The page must be correct with no query state at all**, which falls out of the
 *   same design: no parameter simply means the effect finds nothing to apply.
 *
 * ## What changed, and why
 *
 * This used to write every state change into the URL with `replaceState`. The capability
 * was right; the default was wrong. Three sections read normally turned the address into
 * `?interlock=evidence&layer=workspace&decision=comparison#vreko`, which is a debug
 * harness rather than a finished page, and the reader carried it into their history and
 * anything they pasted without ever asking for it.
 *
 * Now the state is published to a registry instead, and `COPY THIS VIEW` builds the
 * address on demand. Incoming deep links are honoured exactly as before: that half was
 * never the problem.
 *
 * ## The one write that remains
 *
 * A reader who *arrives* at `?interlock=evidence` and then steps to another stage is
 * looking at a page the URL no longer describes. So the first divergence strips that one
 * parameter, with `replaceState`, and nothing is ever added back. The URL only moves
 * toward the clean one, and it never asserts a stage the page is not in.
 */
export function useDeepLinkedState(
  key: string,
  initial: string,
  isValid: (raw: string) => boolean,
): [string, (next: string) => void] {
  const [value, setValue] = useState(initial);

  // `isValid` is typically an inline closure, so listing it as a dependency would make
  // the mount effect re-run on every render and clobber user-driven state. It is only
  // ever consulted once, on mount, so the initial ref value is exactly the right one and
  // the ref is never reassigned.
  const validate = useRef(isValid);

  useEffect(() => {
    const applyLocation = () => {
      const raw = new URLSearchParams(window.location.search).get(key);
      const next = raw !== null && validate.current(raw) ? raw : initial;
      setValue(next);
      publishDeepLinkState(key, next === initial ? null : next);
    };

    applyLocation();
    window.addEventListener('popstate', applyLocation);

    /*
     * Published on unmount as absent. A section removed from a surface must not leave
     * its stage in a link copied from the section beside it.
     */
    return () => {
      window.removeEventListener('popstate', applyLocation);
      publishDeepLinkState(key, null);
    };
  }, [key, initial]);

  const update = useCallback(
    (next: string) => {
      setValue(next);
      publishDeepLinkState(key, next === initial ? null : next);

      /*
       * The reader has moved off whatever the address claimed, so the claim goes. Only
       * ever a deletion: this is the one place the URL is touched during browsing, and
       * it is what keeps `/linear` clean rather than making it stateful again.
       */
      const url = new URL(window.location.href);
      if (!url.searchParams.has(key)) return;

      url.searchParams.delete(key);
      window.history.replaceState(null, '', url);
    },
    [key, initial],
  );

  return [value, update];
}
