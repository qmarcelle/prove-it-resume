import type { RoleLens } from '@/lib/types';
import { defaultRole } from './default';

/**
 * The Product Engineer résumé lens.
 *
 * It exists to give the Product Engineer projection a print route, a manifest entry, a
 * PDF and a download name. It has no page: it sits in `RESUME_ONLY_LENSES`, so
 * `/role/product-engineer` is a 404. It names no company, which keeps it reusable across
 * Product Engineer applications. See ADR 0014.
 *
 * The lens type requires the surface fields, but nothing renders them here. They hold
 * durable values so this file makes no decision about how a future page should read.
 */
export const productEngineer: RoleLens = {
  kind: 'role',
  slug: 'product-engineer',
  resumeProjection: 'product-engineer',
  roleTitle: 'Staff Product Engineer',
  roleFitHeading: defaultRole.roleFitHeading,
  proofOrder: defaultRole.proofOrder,
  mapping: defaultRole.mapping,
  showAvailability: false,
  metaTitle: 'Qwynn Marcelle · Staff Product Engineer',
  metaDescription: 'The résumé of Qwynn Marcelle for Staff Product Engineer roles.',
  isDefault: false,
};
