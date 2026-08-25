import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);

/**
 * Reset the URL between tests.
 *
 * The interaction components reflect their stage into the query string, and jsdom keeps
 * one `window.history` for the whole file. Without this, a test that steps an
 * interaction forward leaves `?decision=…` behind and the next test mounts already
 * advanced — which looks like a component bug and is not one. Resetting here rather than
 * per-file means any future deep-linked component gets the same isolation for free.
 */
afterEach(() => {
  window.history.replaceState(null, '', '/');
});
