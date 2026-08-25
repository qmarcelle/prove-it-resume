import type { RoleLens } from '@/lib/types';
import { defaultRole } from './default';
import { prioritiseMapping } from '@/lib/mapping';

/**
 * The one role lens supplied by the design export, whose props defaulted to
 * `roleTitle: "Senior AI Platform Engineer"` and `roleOrg: "athenahealth / Yoh"`.
 *
 * It exists here as the worked example of a projection. Note what it changes — title,
 * organisation, and the *order* of the evidence map — and what it cannot change: the
 * proofs, the claims, and every boundary. That constraint is structural rather than a
 * convention: a lens has no field in which to put proof content.
 *
 * No other organisation's lens is included, because no other organisation's material was
 * supplied and a mapping for one cannot be inferred.
 */
export const athenahealthYoh: RoleLens = {
  kind: 'role',
  slug: 'athenahealth-yoh',
  resumeProjection: 'default',
  roleTitle: 'Senior AI Platform Engineer',
  organisation: 'athenahealth / Yoh',
  roleFitHeading: 'What these systems have to do with your problem.',
  proofOrder: ['vreko', 'repository-intelligence', 'interlock'],
  // Reordered, not rewritten. Every row is the durable row; this lens only decides what
  // an evaluator for this role should read first. Rows not named keep their order below.
  mapping: prioritiseMapping(defaultRole.mapping, [
    'Build MCP servers and tool surfaces',
    'Introduce agents into developer workflows',
    'Integrate with CI/CD',
    'Build production-grade agent systems',
  ]),
  showAvailability: true,
  metaTitle: 'Qwynn Marcelle — Senior AI Platform Engineer · athenahealth / Yoh',
  metaDescription:
    'Evidence of AI platform and developer systems work, mapped to a Senior AI Platform Engineer role. The same proofs as the durable evidence surface, ordered for this problem.',
  isDefault: false,
};
