import type { Metadata } from 'next';
import { ApplicationSurface } from '@/components/ApplicationSurface';
import { linearApplication } from '@/content/applications';
import { surfaceMetadata } from '@/lib/metadata';

/**
 * The Linear application surface.
 *
 * A route in this application rather than a second deployment. It shares the durable
 * evidence, the design tokens, the evidence-integrity rule, the interactions, the
 * résumé build, the accessibility gates, and the deploy, so a URL path is the right
 * isolation boundary and a second project would only guarantee the two drift. ADR 0010
 * has the full reasoning.
 *
 * `noindex, follow` with a canonical pointing at `/`, and absent from the sitemap. This
 * exists so one link resolves to a page written for the person opening it; it is not a
 * work in its own right and should not compete with the durable artifact in an index.
 * `follow` rather than `nofollow` because the evidence links on it are the whole point
 * and there is no reason to withhold them from a crawler that got here anyway.
 */
export const metadata: Metadata = {
  ...surfaceMetadata(linearApplication, linearApplication.publicPath),
  alternates: { canonical: '/' },
  robots: { index: false, follow: true },
};

export default function LinearPage() {
  return <ApplicationSurface lens={linearApplication} />;
}
