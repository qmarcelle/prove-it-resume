import type { RoleLens } from '@/lib/types';
import { athenahealthYoh } from './athenahealth-yoh';
import { defaultRole } from './default';
import { endToEndDelivery } from './end-to-end-delivery';
import { productEngineer } from './product-engineer';

/** Role lenses addressable at `/role/<slug>`. The default lens is not routed. */
export const ROLE_LENSES: readonly RoleLens[] = [
  athenahealthYoh,
  endToEndDelivery,
  productEngineer,
] as const;

export { athenahealthYoh, defaultRole, endToEndDelivery, productEngineer };
export type { RoleLens };
