import { prioritiseMapping } from '@/lib/mapping';
import type { RoleLens } from '@/lib/types';
import { defaultRole } from './default';

/**
 * The Product Engineer role-family lens.
 *
 * The one role lens with a résumé projection of its own, because a whole family of
 * applications asks the same question and a title swap cannot answer it. It names no
 * company, which is what keeps it a role lens rather than an application surface. See
 * ADR 0014.
 */
export const productEngineer: RoleLens = {
  kind: 'role',
  slug: 'product-engineer',
  resumeProjection: 'product-engineer',
  roleTitle: 'Staff Product Engineer',
  roleFitHeading: 'What these systems have to do with your problem.',
  proofOrder: ['repository-intelligence', 'interlock', 'vreko'],
  mapping: prioritiseMapping(defaultRole.mapping, [
    'Explain architecture rather than hide behind AI-generated code',
    'Improve engineering productivity',
    'Persist agent state across sessions',
  ]),
  // The durable availability line names AI platform work, which is not this lens's role.
  showAvailability: false,
  metaTitle: 'Qwynn Marcelle · Staff Product Engineer',
  metaDescription:
    'Evidence of customer-facing product engineering and the systems beneath it. The same proofs as the durable evidence surface, ordered for a product engineering role.',
  isDefault: false,
};
