import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PROOFS } from '@/content/proofs';
import { CLAIMS } from '@/content/claims';
import { DECISION_RECEIPTS } from '@/content/decisions';
import { CAREER, PROFILES, RESUME, SITE } from '@/content/site';
import { neverAskTwice } from '@/content/supporting/never-ask-twice';
import { PROOF_STEPS } from '@/lib/proof-steps';
import { isResolved } from '@/lib/evidence';
import { ALL_LENSES, ALL_RESUME_LENSES } from '@/content/lenses';
import { defaultRole } from '@/content/roles';
import { resumePdfPath } from '@/lib/resume';
import { PUBLISHED_ORIGINS } from '@/content/published';
import {
  RESUME_CAPABILITY_GROUPS,
  RESUME_CAREER_DURATION,
  RESUME_EMPLOYER,
  RESUME_ROLES,
  RESUME_STACK_LINE,
} from '@/content/resume/facts';

/**
 * Content-integrity tests.
 *
 * These guard the promises the site makes about itself. The most important one is the
 * last block: no evidence record may carry a destination that is merely a GitHub profile
 * or an on-page anchor, because those were the two ways the design draft produced links
 * that looked like evidence and were not.
 */
describe('proof content', () => {
  it('has a section for every rail step that names a proof', () => {
    const sectionIds = new Set(PROOFS.map((proof) => proof.sectionId));
    for (const proof of PROOFS) {
      expect(sectionIds.has(proof.sectionId)).toBe(true);
    }
    // The rail's six stages must all be real anchors somewhere on the page.
    expect(PROOF_STEPS).toHaveLength(6);
    expect(PROOF_STEPS.map((step) => step.id)).toEqual([
      'operating-thesis',
      'vreko',
      'repository-intelligence',
      'interlock',
      'role-fit',
      'career',
    ]);
  });

  it('gives every proof a stated boundary', () => {
    for (const proof of PROOFS) {
      expect(proof.boundary.length).toBeGreaterThan(0);
    }
  });

  it('gives every proof at least one evidence row and one summary row', () => {
    for (const proof of PROOFS) {
      expect(proof.evidence.length).toBeGreaterThan(0);
      expect(proof.summary.length).toBeGreaterThan(0);
    }
  });

  it('uses unique ids across all evidence rows', () => {
    const ids = PROOFS.flatMap((proof) => [
      ...proof.evidence.map((row) => row.id),
      ...proof.summary.map((row) => row.id),
    ]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every proof a compact listing name and summary', () => {
    for (const proof of PROOFS) {
      expect(proof.listing.summary.length).toBeGreaterThan(0);
    }
  });
});

describe('claim ledger', () => {
  it('states a boundary for every claim', () => {
    expect(CLAIMS.length).toBeGreaterThan(0);
    for (const claim of CLAIMS) {
      expect(claim.boundary.length).toBeGreaterThan(0);
      expect(claim.evidence.length).toBeGreaterThan(0);
    }
  });
});

describe('decision receipts', () => {
  it('has a question for every receipt', () => {
    for (const receipt of DECISION_RECEIPTS) {
      expect(receipt.question.length).toBeGreaterThan(0);
    }
  });

  it('answers every question from a recorded decision', () => {
    // These were populated from the Linear issues and Fibery Open Questions that carried
    // the reasoning when each decision was made. An unanswered receipt is still a valid
    // state (the component renders its shape as AWAITING) but a partial one is not: a
    // receipt that states a decision without its constraint or its cost is the kind of
    // tidied-up rationale this section exists to avoid.
    for (const receipt of DECISION_RECEIPTS) {
      expect(receipt.decision).toBeTruthy();
      expect(receipt.constraint).toBeTruthy();
      expect(receipt.tradeoff).toBeTruthy();
      expect(receipt.wouldChangeIf).toBeTruthy();
    }
  });

  it('never links a receipt to an artifact it has not confirmed', () => {
    for (const receipt of DECISION_RECEIPTS) {
      for (const reference of receipt.evidence ?? []) {
        if (reference.verified) expect(reference.href).toBeTruthy();
      }
    }
  });
});

describe('evidence integrity', () => {
  const allRefs = [
    ...PROOFS.flatMap((proof) => [...proof.evidence, ...proof.summary]),
    neverAskTwice.evidence,
    RESUME,
    ...PROFILES,
  ];

  it('never marks a record verified without a destination', () => {
    for (const ref of allRefs) {
      if (ref.verified) expect(ref.href).toBeTruthy();
    }
  });

  it('never points an evidence record at a bare profile page', () => {
    /*
     * Both profiles, personal and organisational. The org page is a better destination
     * for the career section's "selected work" link than the personal one, because it
     * holds the work that sentence names, but it is still an index of repositories
     * rather than the artifact a claim was written against. Promoting it into the
     * evidence model would be the same mistake one level up.
     */
    for (const ref of allRefs) {
      if (!isResolved(ref)) continue;
      expect(ref.href).not.toBe('https://github.com/qmarcelle');
      expect(ref.href).not.toBe('https://github.com/Marcelle-Labs');
    }
  });

  it('never points an evidence record at an on-page anchor', () => {
    for (const ref of allRefs) {
      if (!ref.href) continue;
      expect(ref.href.startsWith('#')).toBe(false);
    }
  });

  /*
   * Evidence lives elsewhere and must say so with an absolute URL. The one exception is
   * an artifact this site generates and serves itself (currently the résumé PDF)
   * which is a root-relative path. That exception is enumerated rather than pattern-
   * matched, so a relative href cannot appear anywhere else by accident.
   */
  const SELF_HOSTED = new Set([RESUME.id]);

  /*
   * The other exception, enumerated for the same reason: a contact address is a way to
   * reach the person, not an artifact anyone can inspect, so it is the one record whose
   * destination is a scheme rather than a page. Naming the id keeps that from becoming
   * a general licence: a `mailto:` anywhere else still fails the check below.
   */
  const CONTACT_SCHEME = new Set(['email']);

  it('states a canonical origin the metadata layer can build absolute URLs from', () => {
    /*
     * `new URL(SITE.origin)` runs at module scope in the root layout, so a malformed
     * value is a build failure with a stack trace pointing at Next rather than at the
     * value. A trailing slash is checked separately because every consumer appends a
     * path: `${origin}/role/x` would become `//role/x` and resolve to a different host.
     */
    expect(() => new URL(SITE.origin)).not.toThrow();
    expect(new URL(SITE.origin).protocol).toBe('https:');
    expect(SITE.origin.endsWith('/')).toBe(false);
  });

  it('gives every lens both halves of its own social card', () => {
    // A lens missing either one silently inherits the durable page's card, which is how
    // `/linear` came to unfurl as a description of a page it is not.
    for (const lens of ALL_LENSES) {
      expect(lens.metaTitle.length, `${lens.slug} has no metaTitle`).toBeGreaterThan(0);
      expect(
        lens.metaDescription.length,
        `${lens.slug} has no metaDescription`,
      ).toBeGreaterThan(0);
    }

    // And no two surfaces may describe themselves identically, or the card stops
    // distinguishing the page it belongs to.
    const titles = ALL_LENSES.map((lens) => lens.metaTitle);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('grounds every career theme on the durable surface in a durable fact', () => {
    /*
     * The career section is hand-written copy in `site.ts`, which makes it the one place
     * on this site where a claim about the employment record can be made without going
     * through `facts.ts`. That is exactly how it drifted: its themes were ten
     * infrastructure nouns and no product signal, months after the corpus established
     * React, Next.js, Sitecore and the portal estate, so the durable surface said less
     * about this career than the tailored one did.
     *
     * The résumé cannot drift that way because a projection has no field to author in.
     * This section can, so it gets the check instead: every theme it lists has to be
     * traceable to something the corpus actually holds.
     *
     * Compared on the leading word, the same way the capability groups are, because
     * "React / Next.js" and "Kubernetes / OpenShift" carry qualifiers that are
     * presentation rather than claim.
     */
    const durable = [
      RESUME_STACK_LINE,
      ...RESUME_ROLES.flatMap((role) => role.bullets.map((bullet) => bullet.text)),
      ...RESUME_CAPABILITY_GROUPS.map((group) => group.items),
      // Titles and the employer note, because two of these themes are context rather
      // than technology: "engineering leadership" is established by the chronology of
      // titles held, and "regulated production environments" by the employer record.
      // A durable fact does not have to be a tool to be a fact.
      ...RESUME_ROLES.map((role) => role.title),
      RESUME_EMPLOYER.note,
    ]
      .join(' · ')
      .toLowerCase();

    const themes = CAREER.entries.flatMap((entry) =>
      'tags' in entry && entry.tags ? entry.tags : [],
    );
    expect(themes.length).toBeGreaterThan(0);

    for (const theme of themes) {
      const head = theme.split(/[ /(,]/)[0].toLowerCase();
      expect(
        durable,
        `the career section claims "${theme}" with no durable fact`,
      ).toContain(head);
    }
  });

  it('states the employment span rather than a rounded one', () => {
    /*
     * `~10 YEARS` sat here for months. It is the retired "8 years in technology" error
     * pointing the other way: the tenure runs 08/2016 to 03/2026, so a tilde rounding up
     * to a decade claims more than the dates support. A span states itself.
     */
    const metas = CAREER.entries.map((entry) => entry.meta).join(' ');
    expect(metas).toContain(RESUME_EMPLOYER.span);
    expect(metas, 'a rounded career figure is back').not.toMatch(/~\s*\d+\s*years/i);
  });

  it('never restates a career figure the fact corpus has retired', () => {
    /*
     * The résumé has its own guard for this. It was not enough: the retired figure lived
     * on in the `/linear` hero as "Eight years in technology", spelled out, where a test
     * looking for the numeral could not see it and neither could a search.
     *
     * The corpus is the authority on how long the career is, so every surface that talks
     * about it is checked against the same record. A projection test cannot cover the
     * pages that are not projections.
     */
    const surfaces = [
      ...ALL_LENSES.flatMap((lens) => [lens.metaTitle, lens.metaDescription]),
      // Application lenses carry their own hero copy; role lenses do not.
      ...ALL_LENSES.flatMap((lens) =>
        'hero' in lens
          ? [lens.hero.headline, lens.hero.supporting, lens.hero.thesis]
          : [],
      ),
      SITE.headline,
      SITE.thesis,
      SITE.supporting,
    ].join(' ');

    for (const retired of RESUME_CAREER_DURATION.retired) {
      expect(
        surfaces.toLowerCase(),
        `a surface still states the retired figure "${retired}"`,
      ).not.toContain(retired.toLowerCase());
    }
  });

  it('resolves external evidence only to absolute https URLs', () => {
    for (const ref of allRefs) {
      if (!isResolved(ref)) continue;
      if (SELF_HOSTED.has(ref.id) || CONTACT_SCHEME.has(ref.id)) continue;
      expect(ref.href).toMatch(/^https:\/\//);
    }
  });

  it('resolves the contact record to a mailto address', () => {
    for (const ref of allRefs) {
      if (!isResolved(ref) || !CONTACT_SCHEME.has(ref.id)) continue;
      expect(ref.href).toMatch(/^mailto:[^@\s]+@[^@\s]+$/);
    }
  });

  it('resolves self-hosted artifacts to a root-relative path', () => {
    for (const ref of allRefs) {
      if (!isResolved(ref) || !SELF_HOSTED.has(ref.id)) continue;
      expect(ref.href).toMatch(/^\/[\w.-]+$/);
    }
  });
});

/**
 * The generated résumé PDFs.
 *
 * These are committed artifacts, so the thing most likely to go wrong is a link to a
 * file that was renamed or never regenerated. Checking the filesystem catches that at
 * `pnpm test` rather than as a 404 for a reader who clicked "Download résumé".
 */
describe('résumé artifacts', () => {
  // Every lens with a generated PDF, of either kind. Registering an application lens
  // adds its artifact to this check without an edit here.
  const lenses = ALL_RESUME_LENSES;

  it('has a distinct generated PDF for every lens', () => {
    const paths = lenses.map((lens) => resumePdfPath(lens));
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('has the file on disk that each lens links to', () => {
    for (const lens of lenses) {
      const file = join(process.cwd(), 'public', resumePdfPath(lens).replace(/^\//, ''));
      expect(existsSync(file), `${resumePdfPath(lens)} is linked but not generated`).toBe(
        true,
      );
    }
  });

  it('serves the neutral lens from the RESUME record', () => {
    expect(RESUME.href).toBe(resumePdfPath(defaultRole));
  });
});

/**
 * The published-first rule.
 *
 * A reader should land on the site or docs a person can actually read; the repository
 * the claim was written against belongs underneath as a citation, not as the
 * destination. These checks keep that ordering from quietly inverting: the failure
 * mode is a future contributor "fixing" a CTA back to a GitHub URL because it felt more
 * precise, which is precisely the trade this made deliberately.
 */
describe('published-first linking', () => {
  const allRefs = [
    ...PROOFS.flatMap((proof) => [...proof.evidence, ...proof.summary]),
    neverAskTwice.evidence,
  ];

  it('pairs every source pin with a label, and never the other way round', () => {
    for (const ref of allRefs) {
      expect(Boolean(ref.sourceHref)).toBe(Boolean(ref.sourceLabel));
    }
  });

  it('never uses a source pin as the call to action', () => {
    for (const ref of allRefs) {
      if (!ref.sourceHref) continue;
      expect(ref.href).not.toBe(ref.sourceHref);
    }
  });

  it('points the call to action at a published surface whenever a pin exists', () => {
    for (const ref of allRefs) {
      if (!ref.sourceHref) continue;
      expect(
        PUBLISHED_ORIGINS.some((origin) => ref.href?.startsWith(origin)),
        `${ref.id} has a pinned source, so its call to action must be a published page`,
      ).toBe(true);
    }
  });

  it('pins to an absolute https URL', () => {
    for (const ref of allRefs) {
      if (!ref.sourceHref) continue;
      expect(ref.sourceHref).toMatch(/^https:\/\//);
    }
  });

  it('keeps the Interlock cockpit links inside the contract it publishes', () => {
    // The cockpit refuses substitution: an unrecognised run or state renders
    // "Run unavailable" rather than the canonical run. These are the ids its published
    // view-model declares, checked against the running site.
    const RUNS = ['hac330-local', 'hac340-cloud'];
    const STATES = ['run.local.treatment', 'run.local.baseline', 'run.cloud.overview'];

    const cockpit = allRefs.filter((ref) =>
      ref.href?.startsWith('https://interlock.marcellelabs.io/?'),
    );
    expect(cockpit.length).toBeGreaterThan(0);

    for (const ref of cockpit) {
      const params = new URL(ref.href as string).searchParams;
      expect(RUNS).toContain(params.get('run'));
      expect(['local', 'cloud']).toContain(params.get('proof'));
      expect(STATES).toContain(params.get('state'));
    }
  });
});
