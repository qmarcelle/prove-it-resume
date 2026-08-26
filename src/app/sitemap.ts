import type { MetadataRoute } from 'next';
import { SITE } from '@/content/site';

/**
 * One durable page. Role lenses and application surfaces are deliberately excluded:
 * they are projections of this page, and listing them would advertise every open
 * application.
 *
 * The URL is absolute because the protocol requires it: a relative `<loc>` is an
 * invalid entry, not a portable one. It was relative for as long as no canonical origin
 * had been verified; one has, and `SITE.origin` is where it is stated.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE.origin}/`,
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
