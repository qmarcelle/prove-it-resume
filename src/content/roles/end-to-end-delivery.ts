import { prioritiseMapping } from '@/lib/mapping';
import type { RoleLens } from '@/lib/types';
import { defaultRole } from './default';

/**
 * The delivery lens.
 *
 * The other lenses answer "is this person right for this role". This one answers the
 * narrower question contract and platform buyers actually ask: can one person carry a
 * technical problem from discovery through to verified production, or do they hand off
 * at the interesting part?
 *
 * Like every lens it is a projection. The rows below are the durable rows, promoted
 * into delivery order — discover, architect, build, integrate, release and deploy,
 * then verify and bound. Nothing is rewritten for this audience, because a row copied
 * for emphasis is a row that can drift away from the evidence it describes.
 *
 * The receipts for each stage are on the proofs themselves, not here: a lens has no
 * field in which to put evidence, which is what makes the projection safe.
 */
export const endToEndDelivery: RoleLens = {
  kind: 'role',
  slug: 'end-to-end-delivery',
  resumeProjection: 'default',
  roleTitle: 'End-to-end delivery · discovery through production verification',
  resumeTitle: 'End-to-end delivery engineer',
  roleFitHeading: 'Discover → architect → build → test → release → deploy → verify.',
  // Interlock first: it is the only claim carrying a frozen packet, an independent
  // verifier and an explicit not-claimed list, which is what "verified" has to mean.
  proofOrder: ['interlock', 'repository-intelligence', 'vreko'],
  mapping: prioritiseMapping(defaultRole.mapping, [
    'Improve engineering productivity',
    'Build production-grade agent systems',
    'Build MCP servers and tool surfaces',
    'Persist agent state across sessions',
    'Integrate agents with enterprise metadata systems',
    'Integrate with CI/CD',
    'Explain architecture rather than hide behind AI-generated code',
  ]),
  showAvailability: true,
  metaTitle: 'Qwynn Marcelle — end-to-end delivery evidence',
  metaDescription:
    'Discovery, architecture, implementation, testing, release, deployment and verification, each bound to a public artifact with its limits stated.',
  isDefault: false,
};
