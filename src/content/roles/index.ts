import type { RoleLens } from '@/lib/types';
import { athenahealthYoh } from './athenahealth-yoh';
import { defaultRole } from './default';
import { endToEndDelivery } from './end-to-end-delivery';
import { productEngineer } from './product-engineer';

/** Role lenses addressable at `/role/<slug>`. The default lens is not routed. */
export const ROLE_LENSES: readonly RoleLens[] = [
  athenahealthYoh,
  endToEndDelivery,
] as const;

/**
 * Lenses with a printable résumé and no page. They are not addressable at `/role/<slug>`.
 * See ADR 0014.
 */
export const RESUME_ONLY_LENSES: readonly RoleLens[] = [productEngineer] as const;

export { athenahealthYoh, defaultRole, endToEndDelivery, productEngineer };
export type { RoleLens };
