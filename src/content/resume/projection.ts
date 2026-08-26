import type { LinearReceipt, ResumeProjectionId } from '@/lib/types';
import {
  RESUME_CAPABILITY_GROUPS,
  RESUME_CERTIFICATIONS,
  RESUME_EDUCATION,
  RESUME_EMPLOYER,
  RESUME_FOOTER,
  RESUME_IDENTITY,
  RESUME_NONPROFIT,
  RESUME_ROLES,
  RESUME_STACK_LINE,
  RESUME_SYSTEMS,
  RESUME_SYSTEMS_BOUNDARY,
  type CapabilityGroupFact,
  type ResumeRoleFact,
  type ResumeSystemFact,
} from './facts';

/**
 * A résumé content projection, and the resolver that applies it.
 *
 * A projection is a set of *selections over ids*. It names which systems appear and in
 * what order, which of a role's durable bullets to print and in what order, which
 * capability groups to show, and what to call each block. It carries framing copy: a
 * profile paragraph, a block label, and it carries no facts, because there is nowhere
 * to put one: every list below is a list of ids.
 *
 * `resolveResume` turns that into a plain object the layout renders. Unknown ids are a
 * thrown error rather than a silent omission: a projection that names a fact which no
 * longer exists has quietly stopped saying what its author meant, and on a fixed
 * two-page sheet the failure would otherwise be a gap nobody notices.
 */

/** Which of a role's durable bullets to print, and in what order. */
export type RoleSelection = {
  id: string;
  /** Bullet ids, ordered. Absent means every bullet in its durable order. */
  bulletIds?: readonly string[];
};

export type ResumeProjection = {
  id: ResumeProjectionId;
  /** Which explicit two-page composition renders this. */
  layout: 'default' | 'linear';
  domains: string;
  profile: {
    label: string;
    heading: string;
    body: string;
  };
  systems: {
    /** Block label, one entry per rendered line. */
    labelLines: readonly string[];
    note: string;
    /**
     * System ids, ordered. A bare id prints every durable bullet; the object form
     * selects, exactly as a role selection does, so a projection short of space
     * shortens an entry rather than dropping the system.
     */
    entries: readonly (string | { id: string; bulletIds?: readonly string[] })[];
    /** A further system rendered as a one-line footnote rather than an article. */
    compact?: { label: string; systemId: string };
    boundaryLabel: string;
    /** Print each system's tool chain. Off where a grouped capability block repeats it. */
    showStack?: boolean;
  };
  experience: {
    labelLines: readonly string[];
    note: string;
    roles: readonly RoleSelection[];
  };
  /** The Linear-specific block. Absent on projections that do not carry receipts. */
  agentPlatform?: {
    labelLines: readonly string[];
    note: string;
    receipts: readonly LinearReceipt[];
    boundaryLabel: string;
    boundary: string;
  };
  foundation: {
    labelLines: readonly string[];
    stack:
      | { label: string; kind: 'line' }
      | { label: string; kind: 'groups'; groupIds: readonly string[] };
    educationLabel: string;
    certificationsLabel?: string;
    nonprofitLabel?: string;
  };
  footerTrailing: string;
  /** Where the printed footer sends a reader. Root for the durable résumé. */
  footerLink: { label: string; href: string };
};

export type ResolvedRole = {
  id: string;
  title: string;
  dates: string;
  bullets: readonly string[];
};

export type ResolvedResume = ReturnType<typeof resolveResume>;

function requireSystem(id: string): ResumeSystemFact {
  const system = RESUME_SYSTEMS.find((entry) => entry.id === id);
  if (!system) throw new Error(`résumé projection names an unknown system: ${id}`);
  return system;
}

function requireRole(id: string): ResumeRoleFact {
  const role = RESUME_ROLES.find((entry) => entry.id === id);
  if (!role) throw new Error(`résumé projection names an unknown role: ${id}`);
  return role;
}

function requireGroup(id: string): CapabilityGroupFact {
  const group = RESUME_CAPABILITY_GROUPS.find((entry) => entry.id === id);
  if (!group)
    throw new Error(`résumé projection names an unknown capability group: ${id}`);
  return group;
}

function selectBullets(role: ResumeRoleFact, ids?: readonly string[]): readonly string[] {
  if (!ids) return role.bullets.map((bullet) => bullet.text);

  return ids.map((id) => {
    const bullet = role.bullets.find((entry) => entry.id === id);
    if (!bullet) {
      throw new Error(`résumé projection names an unknown bullet: ${id}`);
    }
    return bullet.text;
  });
}

export function resolveResume(projection: ResumeProjection) {
  const compact = projection.systems.compact;

  return {
    id: projection.id,
    layout: projection.layout,

    identity: RESUME_IDENTITY,
    domains: projection.domains,

    profile: projection.profile,

    systems: {
      labelLines: projection.systems.labelLines,
      note: projection.systems.note,
      entries: projection.systems.entries.map((entry) => {
        const selection = typeof entry === 'string' ? { id: entry } : entry;
        const system = requireSystem(selection.id);
        if (!selection.bulletIds) return system;

        return {
          ...system,
          bullets: selection.bulletIds.map((id) => {
            const bullet = system.bullets.find((candidate) => candidate.id === id);
            if (!bullet) {
              throw new Error(`résumé projection names an unknown bullet: ${id}`);
            }
            return bullet;
          }),
        };
      }),
      compact: compact
        ? { label: compact.label, system: requireSystem(compact.systemId) }
        : undefined,
      showStack: projection.systems.showStack ?? true,
      boundaryLabel: projection.systems.boundaryLabel,
      boundary: RESUME_SYSTEMS_BOUNDARY,
    },

    experience: {
      labelLines: projection.experience.labelLines,
      note: projection.experience.note,
      employer: RESUME_EMPLOYER,
      roles: projection.experience.roles.map((selection): ResolvedRole => {
        const role = requireRole(selection.id);
        return {
          id: role.id,
          title: role.title,
          dates: role.dates,
          bullets: selectBullets(role, selection.bulletIds),
        };
      }),
    },

    agentPlatform: projection.agentPlatform,

    foundation: {
      labelLines: projection.foundation.labelLines,
      stack:
        projection.foundation.stack.kind === 'line'
          ? { label: projection.foundation.stack.label, line: RESUME_STACK_LINE }
          : {
              label: projection.foundation.stack.label,
              groups: projection.foundation.stack.groupIds.map(requireGroup),
            },
      educationLabel: projection.foundation.educationLabel,
      education: RESUME_EDUCATION,
      certifications: projection.foundation.certificationsLabel
        ? {
            label: projection.foundation.certificationsLabel,
            ...RESUME_CERTIFICATIONS,
          }
        : undefined,
      nonprofit: projection.foundation.nonprofitLabel
        ? { label: projection.foundation.nonprofitLabel, ...RESUME_NONPROFIT }
        : undefined,
    },

    footer: {
      lead: RESUME_FOOTER.lead,
      link: projection.footerLink,
      trailing: projection.footerTrailing,
    },
  };
}
