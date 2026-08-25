import type { RoleLens } from '@/lib/types';
import { athenahealthYoh } from './athenahealth-yoh';
import { defaultRole } from './default';
import { endToEndDelivery } from './end-to-end-delivery';

/** Role lenses addressable at `/role/<slug>`. The default lens is not routed. */
export const ROLE_LENSES: readonly RoleLens[] = [
  athenahealthYoh,
  endToEndDelivery,
] as const;

export { athenahealthYoh, defaultRole, endToEndDelivery };
export type { RoleLens };
