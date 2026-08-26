import type { ApplicationLens } from '@/lib/types';
import { linearApplication } from './linear';

/**
 * Application lenses. Each owns a first-class route of its own: `/linear`, not
 * `/role/linear`, because it is a surface addressed to one organisation rather than a
 * generic projection of the durable page.
 *
 * They are deliberately *not* in `ROLE_LENSES`. Keeping the registries separate is what
 * stops `/role/[slug]` from emitting a second public representation of the same
 * application: `generateStaticParams` there walks role slugs only, and
 * `dynamicParams: false` turns `/role/linear` into a 404 rather than a duplicate.
 */
export const APPLICATION_LENSES: readonly ApplicationLens[] = [
  linearApplication,
] as const;

export { linearApplication };
