import type { MetadataRoute } from 'next';

/**
 * One durable page. Role lenses are deliberately excluded: they are projections of this
 * page, and listing them would advertise every open application.
 *
 * No absolute origin has been verified for this project yet, so URLs are root-relative
 * and Next resolves them against the deployment host. Setting `metadataBase` in the root
 * layout is the change to make once a canonical domain is confirmed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: '/',
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
