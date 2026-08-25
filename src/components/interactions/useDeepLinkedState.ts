'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * One interaction state, reflected in the query string.
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
 * State is written with `replaceState` rather than `pushState`: stepping through a
 * disclosure should not fill the back button with intermediate stages.
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
    const raw = new URLSearchParams(window.location.search).get(key);
    if (raw !== null && validate.current(raw)) {
      setValue(raw);
    }
  }, [key]);

  const update = useCallback(
    (next: string) => {
      setValue(next);

      const url = new URL(window.location.href);
      if (next === initial) {
        // The default state is the one with no parameter, so a reader who steps back to
        // it gets a clean URL rather than one asserting a redundant stage.
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, next);
      }
      window.history.replaceState(null, '', url);
    },
    [key, initial],
  );

  return [value, update];
}
