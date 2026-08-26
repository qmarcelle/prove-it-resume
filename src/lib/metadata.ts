import type { Metadata } from 'next';
import { SITE } from '@/content/site';
import type { SurfaceLens } from './types';

/**
 * The social card for one surface.
 *
 * ## The defect this exists to remove
 *
 * Only `title` and `description` were set per route. `openGraph` was declared once in
 * the root layout from the durable lens and inherited by everything below it, so
 * `/linear`, whose whole reason to exist is that it is addressed to one reader,
 * unfurled in Slack as "Qwynn Marcelle · Prove It Resume" over a description of the
 * three durable proofs. The `<title>` was right and the card was about a different page.
 *
 * That card is the first thing most recipients see, because a link sent to a hiring
 * team is pasted into a channel before it is opened. Getting the tab right and the
 * unfurl wrong is getting the wrong one right.
 *
 * ## Why a helper rather than a field on each route
 *
 * Three routes need the same four values derived from the same two, and the failure
 * mode is silent: a route that forgets `openGraph` does not break, it inherits. Deriving
 * it from the lens means a lens is the only place a surface describes itself, and
 * `content.test.ts` asserts every lens carries both halves.
 */
export function surfaceMetadata(lens: SurfaceLens, path: string): Metadata {
  return {
    title: { absolute: lens.metaTitle },
    description: lens.metaDescription,
    openGraph: {
      type: 'profile',
      title: lens.metaTitle,
      description: lens.metaDescription,
      siteName: 'Prove It Resume',
      url: `${SITE.origin}${path}`,
    },
    twitter: {
      card: 'summary',
      title: lens.metaTitle,
      description: lens.metaDescription,
    },
  };
}
