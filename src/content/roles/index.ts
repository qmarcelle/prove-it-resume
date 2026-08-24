import type { RoleLens } from '@/lib/types';
import { athenahealthYoh } from './athenahealth-yoh';
import { defaultRole } from './default';

/** Role lenses addressable at `/role/<slug>`. The default lens is not routed. */
export const ROLE_LENSES: readonly RoleLens[] = [athenahealthYoh] as const;

export { athenahealthYoh, defaultRole };
export type { RoleLens };
