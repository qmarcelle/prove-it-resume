import { describe, expect, it } from 'vitest';
import {
  RESUME_CAPABILITY_GROUPS,
  RESUME_CAREER_DURATION,
  RESUME_QUANTITIES,
  RESUME_ROLES,
  RESUME_STACK_LINE,
  RESUME_SYSTEMS,
} from './facts';
import { RESUME_PROJECTIONS, resolveResume } from './index';
import type { ResumeProjection } from './projection';

/**
 * The fact/projection invariant, made executable.
 *
 * A projection may select facts, order them, group them, and frame them. The thing it
 * must never do is author one, and "author" includes the quiet versions: rounding a
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

/**
 * Everything a projection actually puts on the sheet: its own prose *and* the durable
 * bullets it selected. The numeral check reads both, because a number is no safer in a
 * bullet than in a paragraph: "14-person engineering team" and "an additional 10
 * contractors" are exactly the kind of figure that gets quietly merged into one.
 */
function printedCopy(projection: ResumeProjection): string {
  const resolved = resolveResume(projection);
  return [
    ...framingCopy(projection),
    ...resolved.experience.roles.flatMap((role) => role.bullets),
    ...resolved.systems.entries.flatMap((system) =>
      system.bullets.map((bullet) => bullet.text),
    ),
  ].join(' ');
}

/** Numerals in `copy` that do not sit inside one of the permitted quantity phrases. */
function unpermittedNumerals(copy: string) {
  const spans = RESUME_QUANTITIES.flatMap(({ claim }) => {
    const spots: { start: number; end: number }[] = [];
    for (let at = copy.indexOf(claim); at !== -1; at = copy.indexOf(claim, at + 1)) {
      spots.push({ start: at, end: at + claim.length });
    }
    return spots;
  });

  return [...copy.matchAll(/\d+(?:\.\d+)?/g)].filter(
    (match) =>
      !spans.some(
        (span) => match.index >= span.start && match.index + match[0].length <= span.end,
      ),
  );
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

  it('never states a quantity the corpus has not established, about a subject it has not established', () => {
    /*
     * Two failures, not one.
     *
     * The obvious one is inflation: a figure becoming a larger figure for a reader who
     * seems to want one. The one that actually shipped is quieter: the numeral stays
     * and the *subject* moves. "8 years in technology" became "8 years building
     * production software inside regulated healthcare", printed above an employer row
     * dated 2016 – 2026, so a career-long figure was re-attached to one employer's span
     * and read additively with the 2.5 beside it to more years than that span holds.
     *
     * A numeral-only check passes that. So every number a projection prints must occur
     * *inside* one of the permitted phrases, at the position it appears, which makes
     * the noun part of what is asserted. Bullets are read as well as framing prose: the
     * team-scope figures live in a bullet, and "14 engineers plus 10 contractors"
     * collapsing into "24 reports" is the same failure in a different paragraph.
     */
    for (const projection of projections) {
      const copy = printedCopy(projection);

      for (const match of unpermittedNumerals(copy)) {
        const at = match.index;
        const permitted = RESUME_QUANTITIES.find((q) => q.value === match[0]);

        expect(
          permitted,
          `${projection.id} states the quantity "${match[0]}", which is not in RESUME_QUANTITIES`,
        ).toBeDefined();

        expect(
          false,
          `${projection.id} states "${match[0]}" outside its established claim.\n` +
            `  permitted: "${permitted?.claim}"\n` +
            `  basis:     ${permitted?.basis}\n` +
            `  context:   …${copy.slice(Math.max(0, at - 60), at + 60)}…`,
        ).toBe(true);
      }
    }
  });

  it('retires the career figure the employment dates contradict', () => {
    /*
     * "8 years in technology" is not merely stale, it is checkable and wrong: the
     * BlueCross row alone runs 08/2016 – 03/2026. A reader auditing this artifact
     * (which the artifact explicitly invites) finds it on page one. No projection may
     * reintroduce it, in that wording or in a re-attached one.
     */
    for (const projection of projections) {
      const copy = printedCopy(projection);
      for (const retired of RESUME_CAREER_DURATION.retired) {
        expect(
          copy,
          `${projection.id} restates the retired career figure "${retired}"`,
        ).not.toContain(retired);
      }
      expect(
        copy,
        `${projection.id} attaches a bare year count to the career`,
      ).not.toMatch(/\b\d+(?:\.\d+)? years (?:in technology|building|of production)/i);
    }
  });

  it('states career duration only in the durable phrasing', () => {
    // Both projections talk about how long the career is. There is one sentence in the
    // corpus for that, so a projection either uses it or does not make the claim; a
    // second wording is how "nearly a decade" becomes "over a decade" one edit later.
    for (const projection of projections) {
      const copy = framingCopy(projection).join(' ').toLowerCase();
      if (!/\bdecade\b/.test(copy)) continue;

      expect(
        copy,
        `${projection.id} claims a career duration in wording the corpus does not hold`,
      ).toContain(RESUME_CAREER_DURATION.claim.toLowerCase());
    }
  });

  it('keeps the direct team and the contractors separately counted', () => {
    /*
     * The record establishes a 14-person team *and* ten further contractors in the same
     * delivery system. Added together they read as 24 direct reports, which the corpus
     * does not establish and which is the single most flattering available misreading.
     * Any projection printing one figure must print the other, and in the additive
     * wording.
     */
    for (const projection of projections) {
      const copy = printedCopy(projection);
      if (!/\b14\b|\b10 contractors\b/.test(copy)) continue;

      expect(copy, `${projection.id} states a team size without its basis`).toContain(
        '14-person engineering team',
      );
      expect(
        copy,
        `${projection.id} states contractors without marking them as additional`,
      ).toContain('an additional 10 contractors');
      expect(copy, `${projection.id} merges the two counts`).not.toMatch(/\b24\b/);
    }
  });

  it('never claims a fact recorded as unverified', () => {
    /*
     * What is missing from this list is as informative as what is in it. React,
     * Next.js, Sitecore and the per-audience portals used to sit here and no longer do,
     * because the record now carries them.
     *
     * What remains is the set a product-oriented résumé would still like to assert and
     * cannot. GraphQL is the one to watch: it is on the target role's published stack,
     * which is precisely the pressure this check exists to resist, and no record
     * supplied here establishes it. The capability nouns are the other half, and they
     * are the most plausible-sounding things to invent about a broker portal nobody
     * outside the company can open.
     *
     * Note what left the list. A bare `enrol` used to be forbidden and now is not,
     * because member enrollment data is established: it is one of the things the
     * services this team owned actually supplied. "Enrollment administration" as a
     * broker capability is still forbidden, because that is a different claim. The
     * guard has to track the record, or it starts protecting the wrong sentence.
     */
    const forbidden = [
      /\bangular\b/i,
      /\bvue\b/i,
      /\bsvelte\b/i,
      /\bredux\b/i,
      /\bgraphql\b/i,
      /\bquoting\b/i,
      /\bgroup administration\b/i,
      /\bgroup billing\b/i,
      /\benrollment administration\b/i,
      /\bcommissions\b/i,
      /\beligibility\b/i,
    ];
    for (const projection of projections) {
      const copy = printedCopy(projection);
      for (const pattern of forbidden) {
        expect(copy, `${projection.id} claims ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it('states what the 2016–2019 period actually was', () => {
    /*
     * This assertion is the inverse of the one it replaced, and the reversal is the
     * point. For most of this repository's life the earliest role was title-only, and a
     * test held every projection to printing nothing under it, because the alternative
     * was inferring three years of work backwards from the later roles.
     *
     * The record has since been supplied: production support, provider applications,
     * Contact Preference and Fee Schedule, a React application library. The gap is
     * closed, so the guard changes from "print nothing here" to "the two applications
     * with a single named author are durable facts and reach the sheet".
     */
    const developer = RESUME_ROLES.find((role) => role.id === 'developer');
    const text = (developer?.bullets ?? []).map((bullet) => bullet.text).join(' ');
    expect(text).toContain('Contact Preference');
    expect(text).toContain('Fee Schedule');

    // And the sheet addressed to a product reader actually prints it.
    const linear = resolveResume(RESUME_PROJECTIONS.linear);
    const printed = linear.experience.roles.find((role) => role.id === 'developer');
    expect(printed?.bullets.join(' ')).toContain('Contact Preference');
  });

  it('never states team work in the voice of a personal author', () => {
    /*
     * The failure this guards is quiet and flattering. A portal estate delivered by
     * fourteen engineers and a résumé line reading "Built the member portal" sit three
     * lines apart in the same typeface, and nothing in the copy tells the reader which
     * of the two shapes of fact they are looking at.
     *
     * `ownership` makes it a field. A `team` bullet has to attribute to the team in its
     * own words, and may not open on a verb that claims authorship, so a projection
     * cannot promote team work into personal work without editing a durable string.
     */
    const AUTHORSHIP =
      /^(Built|Wrote|Implemented|Coded|Designed|Developed|Architected|Shipped|Created)\b/;
    const roleBullets = RESUME_ROLES.flatMap((role) => role.bullets);
    expect(roleBullets.filter((b) => b.ownership === 'team').length).toBeGreaterThan(0);
    expect(roleBullets.filter((b) => b.ownership === 'personal').length).toBeGreaterThan(
      0,
    );

    for (const bullet of roleBullets) {
      if (bullet.ownership !== 'team') continue;
      expect(bullet.text, `${bullet.id} describes team work without saying so`).toMatch(
        /\bteam\b/i,
      );
      expect(
        bullet.text,
        `${bullet.id} opens on a personal authorship verb for team-owned work`,
      ).not.toMatch(AUTHORSHIP);
    }
  });

  it('states no quantitative outcome the record does not carry', () => {
    /*
     * The oldest and most tempting résumé fiction: "reduced build times by 40%".
     * Nothing supplied to this corpus carries a measured outcome, so no percentage may
     * appear anywhere a projection prints, and `RESUME_QUANTITIES` has no entry that
     * could license one. Qualitative outcome language is what the record supports and
     * is what these bullets use.
     */
    for (const projection of projections) {
      const copy = printedCopy(projection);
      expect(copy, `${projection.id} states a percentage`).not.toMatch(/\d\s?%|percent/i);
    }
  });

  it('derives every product-engineering claim from a durable fact', () => {
    /*
     * The claims a reader of a product role checks first, asserted against the corpus
     * rather than against a projection. A projection can only select durable strings, so
     * proving the fact exists here proves every sheet that prints it is grounded, and it
     * is the corpus that has to be edited to change the claim.
     */
    const durable = RESUME_ROLES.flatMap((role) =>
      role.bullets.map((bullet) => bullet.text),
    ).join(' ');

    for (const claim of [
      'React',
      'Next.js',
      'Sitecore',
      'Contact Preference',
      'Fee Schedule',
      'Consumer Portals',
      'multi-tenant',
      'Facets',
      'Azure DevOps',
      'CIAM',
    ]) {
      expect(durable, `${claim} is printed without a durable fact behind it`).toContain(
        claim,
      );
    }

    // The three portal audiences are established as one estate under one team, and the
    // corpus says so in that shape rather than as three separate ownership claims.
    expect(durable).toContain('member and broker/employer');
  });

  it('keeps the hands-on record hands-on', () => {
    // The mirror of the check above. A leadership résumé that tags everything `team`
    // to be safe has erased the thing a product reader is looking for, so the two
    // applications this person wrote are asserted to be personal facts.
    const personal = RESUME_ROLES.flatMap((role) => role.bullets)
      .filter((bullet) => bullet.ownership === 'personal')
      .map((bullet) => bullet.text)
      .join(' ');

    expect(personal).toContain('Contact Preference');
    expect(personal).toContain('Fee Schedule');
    expect(personal).toMatch(/React/);
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
  it('covers every role and reorders nothing', () => {
    /*
     * The neutral résumé is the artifact a hundred processes may already hold, and the
     * guarantee it carries is that it is not a pitch. It used to enforce that by
     * printing every durable bullet, which stopped being possible on two pages once the
     * corpus grew a hands-on 2016–2019 period and a full-stack ownership record.
     *
     * So the invariant moved to the property that was actually doing the work: this
     * sheet presents every role, in durable order, with each role's bullets in durable
     * order. It may print fewer. It may not rearrange the career to suit a reader,
     * which is the only thing that would make it a different document.
     */
    const resolved = resolveResume(RESUME_PROJECTIONS.default);
    expect(resolved.experience.roles.map((role) => role.id)).toEqual(
      RESUME_ROLES.map((role) => role.id),
    );

    for (const [index, role] of resolved.experience.roles.entries()) {
      const durable = RESUME_ROLES[index].bullets.map((bullet) => bullet.text);
      expect(role.bullets.length, `${role.id} prints nothing`).toBeGreaterThan(0);
      const positions = role.bullets.map((text) => durable.indexOf(text));
      expect(positions, `${role.id} prints a bullet that is not durable`).not.toContain(
        -1,
      );
      expect(positions, `${role.id} reorders the durable record`).toEqual(
        [...positions].sort((a, b) => a - b),
      );
    }
  });
});

describe('the Linear projection', () => {
  const resolved = resolveResume(RESUME_PROJECTIONS.linear);

  it('leads the enterprise record with the customer-facing product surface', () => {
    // The reader's first question is whether this person has shipped a customer-facing
    // product, so the first line of the record answers it: the portals themselves,
    // not the enterprise programmes around them.
    const lead = resolved.experience.roles[0];
    expect(lead.id).toBe('team-lead');
    expect(lead.bullets[0]).toContain('Consumer Portals');
    expect(lead.bullets.join(' ')).toContain('Portal Refresh');
  });

  it('makes the frontend and full-stack record explicit rather than inferable', () => {
    // The point of this projection's rewrite: a reader should not have to deduce that
    // the customer-facing half was built as well as led.
    const copy = [
      resolved.profile.body,
      ...resolved.experience.roles.flatMap((r) => r.bullets),
    ].join(' ');
    for (const claim of ['React', 'Next.js', 'Sitecore', 'MFA']) {
      expect(copy, `the Linear résumé leaves ${claim} to inference`).toContain(claim);
    }
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
