import { describe, expect, it } from 'vitest';
import {
  RESUME_CAPABILITY_GROUPS,
  RESUME_QUANTITIES,
  RESUME_ROLES,
  RESUME_STACK_LINE,
  RESUME_SYSTEMS,
  UNVERIFIED,
} from './facts';
import { RESUME_PROJECTIONS, resolveResume } from './index';
import type { ResumeProjection } from './projection';

/**
 * The fact/projection invariant, made executable.
 *
 * A projection may select facts, order them, group them, and frame them. The thing it
 * must never do is author one — and "author" includes the quiet versions: rounding a
 * number up for an audience, or naming a technology the corpus does not support because
 * the job description mentioned it.
 *
 * These tests are the enforcement. They are why the résumé can be tailored at all: the
 * guarantee that two variants describe the same career is checked rather than promised.
 */

const projections = Object.values(RESUME_PROJECTIONS);

/**
 * Everything a projection renders as prose of its own, rather than by reference.
 *
 * Block labels are excluded: they carry the sheet's own section numbers ("01 /
 * PROFILE"), which are positions in a document rather than claims about a career.
 */
function framingCopy(projection: ResumeProjection): string[] {
  return [
    projection.domains,
    projection.profile.heading,
    projection.profile.body,
    projection.systems.note,
    projection.experience.note,
    projection.footerTrailing,
    projection.agentPlatform?.note ?? '',
  ];
}

describe('résumé projections', () => {
  it('registers each projection under its own id', () => {
    for (const [id, projection] of Object.entries(RESUME_PROJECTIONS)) {
      expect(projection.id).toBe(id);
    }
  });

  it('resolves every projection without naming a fact that does not exist', () => {
    // `resolveResume` throws on an unknown system, role, bullet or capability group.
    // A projection whose selection has gone stale must fail here rather than render a
    // hole in a fixed page box, where the failure is a gap nobody notices.
    for (const projection of projections) {
      expect(() => resolveResume(projection)).not.toThrow();
    }
  });

  it('renders only bullets that exist verbatim in the durable corpus', () => {
    const durable = new Set([
      ...RESUME_ROLES.flatMap((role) => role.bullets.map((bullet) => bullet.text)),
      ...RESUME_SYSTEMS.flatMap((system) => system.bullets.map((bullet) => bullet.text)),
    ]);

    for (const projection of projections) {
      const resolved = resolveResume(projection);
      for (const role of resolved.experience.roles) {
        for (const bullet of role.bullets) expect(durable).toContain(bullet);
      }
      for (const system of resolved.systems.entries) {
        for (const bullet of system.bullets) expect(durable).toContain(bullet.text);
      }
    }
  });

  it('never states a quantity the corpus has not established', () => {
    /*
     * The failure this exists for is silent inflation: "8 years" becoming "10 years"
     * for a reader who seems to want ten. Numbers in framing prose are extracted and
     * checked against the permitted set, so strengthening one is a test failure rather
     * than an edit nobody reviews.
     */
    for (const projection of projections) {
      const numbers = framingCopy(projection)
        .join(' ')
        .match(/\d+(?:\.\d+)?/g);

      for (const number of numbers ?? []) {
        expect(
          RESUME_QUANTITIES,
          `${projection.id} states the quantity "${number}", which is not in RESUME_QUANTITIES`,
        ).toContain(number);
      }
    }
  });

  it('never claims a fact recorded as unverified', () => {
    // The three things a product-oriented résumé would most like to say and cannot.
    const forbidden = [/\breact\b/i, /\bangular\b/i, /\bvue\b/i, /broker portal/i];
    expect(UNVERIFIED.length).toBeGreaterThan(0);

    for (const projection of projections) {
      const copy = framingCopy(projection).join(' ');
      for (const pattern of forbidden) {
        expect(copy, `${projection.id} claims ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it('groups only capabilities the durable record already carries', () => {
    // A grouping is a legibility decision; membership is a fact. Every grouped item must
    // also appear in the undifferentiated stack line or in a system's own tool chain,
    // which is what stops a group becoming the place a new technology quietly appears.
    const durable = [
      RESUME_STACK_LINE,
      ...RESUME_SYSTEMS.map((system) => system.stack),
      // Role bullets too: CIAM is established by the initiatives this role aligned, and
      // a capability the record demonstrates is as durable as one it lists.
      ...RESUME_ROLES.flatMap((role) => role.bullets.map((bullet) => bullet.text)),
    ]
      .join(' · ')
      .toLowerCase();

    for (const group of RESUME_CAPABILITY_GROUPS) {
      for (const item of group.items.split(' · ')) {
        // Compare on the first word: "SQL (ANSI)" and "OpenShift / Kubernetes" appear
        // in the durable run with different qualifiers, and the qualifier is
        // presentation.
        const head = item.split(/[ /(]/)[0].toLowerCase();
        expect(durable, `${group.label} introduces "${item}"`).toContain(head);
      }
    }
  });

  it('keeps every projection to the same two-page geometry', () => {
    for (const projection of projections) {
      expect(['default', 'linear']).toContain(projection.layout);
    }
  });
});

describe('the durable projection', () => {
  it('selects every durable role and every one of their bullets', () => {
    // The neutral résumé is the artifact a hundred processes may already hold. It
    // selects everything, in durable order, and a change here is a deliberate global
    // correction rather than a projection decision.
    const resolved = resolveResume(RESUME_PROJECTIONS.default);
    expect(resolved.experience.roles.map((role) => role.id)).toEqual(
      RESUME_ROLES.map((role) => role.id),
    );
    for (const [index, role] of resolved.experience.roles.entries()) {
      expect(role.bullets).toEqual(RESUME_ROLES[index].bullets.map((b) => b.text));
    }
  });
});

describe('the Linear projection', () => {
  const resolved = resolveResume(RESUME_PROJECTIONS.linear);

  it('leads the enterprise record with the customer-facing initiatives', () => {
    const lead = resolved.experience.roles[0];
    expect(lead.id).toBe('team-lead');
    expect(lead.bullets[0]).toContain('Portal Refresh');
  });

  it('promotes Never Ask Twice out of the footnote and demotes Vreko into it', () => {
    expect(resolved.systems.entries[0].id).toBe('never-ask-twice');
    expect(resolved.systems.compact?.system.id).toBe('vreko');
  });

  it('carries agent-platform receipts, each with a boundary and no link', () => {
    expect(resolved.agentPlatform?.receipts.length).toBeGreaterThan(0);
    for (const receipt of resolved.agentPlatform?.receipts ?? []) {
      expect(receipt.boundary.length).toBeGreaterThan(0);
      expect(receipt.publicEvidenceHref).toBeUndefined();
    }
  });

  it('sends its footer to the Linear surface rather than to the root', () => {
    expect(resolved.footer.link.href).toMatch(/\/linear$/);
  });
});
