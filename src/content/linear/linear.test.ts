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

  it('never points a receipt at a private destination', () => {
    // `publicEvidenceHref` is for the day a receipt has a *public* artifact. A
    // `linear.app` URL is not one: the reader cannot open it, so a link there would
    // imply verification the row does not have.
    for (const receipt of LINEAR_RECEIPTS) {
      if (!receipt.publicEvidenceHref) continue;
      expect(receipt.publicEvidenceHref).toMatch(/^https:\/\//);
      expect(receipt.publicEvidenceHref).not.toContain('linear.app');
    }
  });

  it('records when each curated summary was checked against its source', () => {
    for (const receipt of LINEAR_RECEIPTS) {
      expect(receipt.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('says in the boundary that these are not verified evidence', () => {
    expect(LINEAR_RECEIPTS_BOUNDARY.toLowerCase()).toContain('not verified evidence');
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
