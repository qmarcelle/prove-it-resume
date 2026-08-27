import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LINEAR_RECEIPTS, LINEAR_RECEIPTS_BOUNDARY } from './receipts';

/**
 * The private/public boundary.
 *
 * The Linear surface is the one place in this repository where public output is derived
 * from a private workspace, and the failure mode is not subtle: a URL, an issue body, or
 * a customer name reaching a static bundle that anyone can read. The rule is that the
 * curated array in `receipts.ts` is the *only* channel, and these tests are what make
 * that a property of the build rather than a habit.
 *
 * The last test is the important one. It scans the whole of `src/` for a workspace URL
 * or an API credential, so a future contributor who wires a live integration cannot ship
 * it without this failing first.
 */
describe('Linear receipts', () => {
  it('states a question, a finding, and a boundary for every receipt', () => {
    expect(LINEAR_RECEIPTS.length).toBeGreaterThan(0);
    for (const receipt of LINEAR_RECEIPTS) {
      expect(receipt.question.length).toBeGreaterThan(0);
      expect(receipt.finding.length).toBeGreaterThan(0);
      expect(receipt.boundary.length).toBeGreaterThan(0);
      expect(receipt.status.length).toBeGreaterThan(0);
    }
  });

  it('uses workspace identifiers, not workspace URLs', () => {
    for (const receipt of LINEAR_RECEIPTS) {
      expect(receipt.identifier).toMatch(/^[A-Z]+-\d+$/);
    }
  });

  it('gives every receipt exactly one evidence state', () => {
    // There is no unstated default. A receipt that forgot to declare how far it can be
    // checked would render as whichever branch happened to come last.
    for (const receipt of LINEAR_RECEIPTS) {
      expect(
        ['unresolved', 'private-verified', 'public-verified'],
        `${receipt.identifier} has no evidence state`,
      ).toContain(receipt.evidence.state);
    }
  });

  it('only gives a destination to a receipt that has a public one', () => {
    /*
     * The rule the middle state exists to protect. `private-verified` means the author
     * checked the text against an issue nobody else can open, which is an attestation
     * and not evidence, so it must carry nothing clickable. The moment it gains an href
     * it is making the reader a promise it cannot keep.
     */
    for (const receipt of LINEAR_RECEIPTS) {
      if (receipt.evidence.state === 'public-verified') {
        expect(receipt.evidence.href).toMatch(/^https:\/\//);
        expect(receipt.evidence.href).not.toContain('linear.app');
        expect(receipt.evidence.label.length).toBeGreaterThan(0);
        continue;
      }
      expect(
        receipt.evidence,
        `${receipt.identifier} links a private source`,
      ).not.toHaveProperty('href');
    }
  });

  it('never points a public receipt at a repository known to be private', () => {
    /*
     * A named guard for a mistake already made here rather than a hypothetical one.
     *
     * INFRA-11 was audited as publishable with a link to the Vreko agent-lifecycle
     * implementation. That code lives in `vreko-dev/vreko` and `vreko-dev/content`, both
     * private, both 404 to a signed-out reader. The author browsing their own
     * organisation sees a working URL and cannot see that it works *because they are
     * signed in*.
     *
     * A unit test cannot check reachability without a network call, so it checks the
     * thing it can: these two destinations are known-private and may never appear. The
     * reachability check itself is a human step, recorded in `receipts.ts`, and it is
     * signed-out reachability or it is nothing.
     */
    const KNOWN_PRIVATE = ['vreko-dev/vreko', 'vreko-dev/content', 'vreko-dev/canon'];
    for (const receipt of LINEAR_RECEIPTS) {
      if (receipt.evidence.state !== 'public-verified') continue;
      for (const repo of KNOWN_PRIVATE) {
        expect(
          receipt.evidence.href,
          `${receipt.identifier} points at ${repo}, which is private and 404s for a reader`,
        ).not.toContain(repo);
      }
    }
  });

  it('never lets the printed short form outrun the full finding', () => {
    /*
     * `compact` exists because a two-page sheet cannot hold the full findings, and the
     * hazard it introduces is precise: the short form is where a hedge gets dropped. A
     * printed "boundary defined" that loses "the proof failed its gate" is exactly the
     * overstatement this whole pass was correcting, one field over.
     *
     * So the short form is held to the same limits as the long one. It must be shorter,
     * it must not be a truncation, and where the full finding hedges, the compact form
     * has to hedge too.
     */
    const HEDGES = [
      /conditional|only where|failed/i,
      /validation|not settled|ongoing/i,
      /currently|opening thought/i,
    ];

    LINEAR_RECEIPTS.forEach((receipt, index) => {
      if (!receipt.compact) return;

      expect(
        receipt.compact.length,
        `${receipt.identifier} compact form is not shorter`,
      ).toBeLessThan(receipt.finding.length);

      // A truncation would share a long prefix with the finding and end mid-thought.
      expect(receipt.compact.endsWith('.')).toBe(true);
      expect(receipt.compact).not.toContain('…');

      expect(
        receipt.compact,
        `${receipt.identifier} drops its hedge when printed`,
      ).toMatch(HEDGES[index]);
    });
  });

  it('records when each curated summary was checked against its source', () => {
    for (const receipt of LINEAR_RECEIPTS) {
      if (receipt.evidence.state === 'unresolved') continue;
      expect(receipt.evidence.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('says in the boundary who did the checking and what it is worth', () => {
    /*
     * The boundary used to say "not verified evidence", which was true of the old model
     * and is too blunt for the new one: it flattened checked and unchecked back into one
     * state, which is the conflation the evidence states exist to undo.
     *
     * What it has to carry now is subtler and more honest. Something *was* checked, the
     * person who checked it is the person whose résumé this is, and the reader cannot
     * repeat the check. All three, or the sentence is doing the reader a disservice in
     * one direction or the other.
     */
    const boundary = LINEAR_RECEIPTS_BOUNDARY.toLowerCase();
    expect(boundary).toContain('private linear workspace');
    expect(boundary).toContain('checked against its issue');
    expect(boundary, "the boundary must name this as the author's attestation").toContain(
      "author's attestation",
    );
    expect(
      boundary,
      'the boundary must say the reader cannot repeat the check',
    ).toContain('not something you can open');
  });

  it('claims no public artifact while none of the receipts has one', () => {
    /*
     * The boundary ends by stating that none of these is public. That is a fact about
     * the receipt set rather than a disclaimer, so it has to move when the set does.
     * Keeping the two in step is what stops the sentence quietly becoming false in
     * either direction: still claiming nothing is public after one is, or dropping the
     * claim while all three still are.
     */
    const anyPublic = LINEAR_RECEIPTS.some(
      (receipt) => receipt.evidence.state === 'public-verified',
    );
    expect(/none is public/i.test(LINEAR_RECEIPTS_BOUNDARY)).toBe(!anyPublic);
  });
});

describe('no private Linear data can reach the bundle', () => {
  function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) return sourceFiles(path);
      return /\.(ts|tsx|css)$/.test(entry) ? [path] : [];
    });
  }

  // This file names the host and the credential in order to forbid them, so it is the
  // one file the scan skips.
  const files = sourceFiles(join(process.cwd(), 'src')).filter(
    (file) => !file.endsWith('linear.test.ts'),
  );

  it('contains no Linear workspace URL anywhere in src/', () => {
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      expect(source, `${file} references a Linear workspace URL`).not.toMatch(
        /linear\.app/i,
      );
    }
  });

  it('makes no runtime request to the Linear API', () => {
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      expect(source, `${file} calls the Linear API`).not.toMatch(
        /api\.linear\.app|LINEAR_API_KEY|LINEAR_TOKEN/,
      );
    }
  });
});
