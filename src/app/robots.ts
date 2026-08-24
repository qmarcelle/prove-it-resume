import type { MetadataRoute } from 'next';

/**
 * Role lenses are projections of `/`, not separate works, so they are kept out of the
 * index — both here and via `robots: { index: false }` on the route itself.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/role/' }],
  };
}
