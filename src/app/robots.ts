import type { MetadataRoute } from 'next';
import { APPLICATION_LENSES } from '@/content/applications';

/**
 * Role lenses and application surfaces are projections of `/`, not separate works, so
 * they are kept out of the index — both here and via `robots: { index: false }` on the
 * routes themselves.
 *
 * The disallow list is derived from the registries rather than written out, so
 * registering an application lens cannot leave its route indexable because someone
 * forgot this file. `/role/` is a prefix and covers every role lens at once.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/role/', ...APPLICATION_LENSES.map((lens) => lens.publicPath)],
      },
    ],
  };
}
