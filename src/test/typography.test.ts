import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The em dash gate.
 *
 * ## Why a repository-wide check and not a style note
 *
 * This artifact asks a reader to believe a person wrote it. An em dash between two
 * clauses is the single most reliable surface tell of generated prose, and a document
 * arguing that its claims can be checked cannot afford a typographic habit that makes a
 * reader stop and wonder who actually wrote the argument. A convention nobody enforces
 * survives about two commits, so this is a test.
 *
 * ## Why it covers comments and ADRs, not only rendered copy
 *
 * Because this repository invites people to read them. The README sends an evaluator to
 * `docs/decisions/` and to named source files; the comments in `src/content/` are part
 * of the case, not scaffolding behind it. A gate that stopped at strings a component
 * renders would leave the majority of the prose an evaluator actually reads unchecked.
 *
 * ## What it deliberately allows
 *
 * The en dash stays. It is doing a different job: `08/2016 – 08/2019`, `2016 – 2026`,
 * numeric ranges where the glyph is the punctuation rather than a rhetorical pause.
 * Replacing those with hyphens would be a typographic regression in service of nothing.
 *
 * `design/reference/` is excluded, and that exclusion is load-bearing rather than
 * convenient: it holds the original design export, preserved byte-for-byte with its
 * SHA-256 recorded in `docs/design-provenance.md`. Rewriting its punctuation would break
 * the provenance check and destroy the thing it exists to be. It is quoted evidence, not
 * this repository's prose.
 */

/** Files whose content is quoted or generated rather than authored here. */
const EXCLUDED_PREFIXES = ['design/reference/'];

const EXCLUDED_FILES = new Set(['pnpm-lock.yaml']);

/** Text this repository authors. Binary and lockfile formats are not prose. */
const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.mts',
  '.mjs',
  '.js',
  '.jsx',
  '.css',
  '.md',
  '.json',
  '.yml',
  '.yaml',
  '.html',
  '.txt',
  '.svg',
]);

/*
 * Written as an escape rather than as the character. A gate whose own source is the
 * thing it forbids is a gate that has to exempt itself, and an exemption is the first
 * place the next one gets added.
 */
const EM_DASH = '\u2014';

/**
 * Every file git would keep, tracked or not.
 *
 * `--others --exclude-standard` alongside `--cached` is the load-bearing part, and it
 * was missing on the first attempt. `git ls-files` alone lists only *tracked* files, so
 * a file written and not yet staged is invisible to the check that is supposed to catch
 * it, which is exactly the moment prose gets written. This test file itself was
 * untracked when it was first run, and it passed while containing the character it
 * forbids.
 *
 * Ignored paths stay ignored, so build output, `node_modules` and Playwright's report
 * directory drop out without a second list of them to maintain.
 */
function trackedTextFiles(): string[] {
  const root = join(import.meta.dirname, '..', '..');

  return execFileSync(
    'git',
    ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
    { cwd: root, encoding: 'utf8' },
  )
    .split('\0')
    .filter(Boolean)
    .filter((path) => TEXT_EXTENSIONS.has(extname(path)))
    .filter((path) => !EXCLUDED_FILES.has(path))
    .filter((path) => !EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix)))
    .map((path) => join(root, path));
}

describe('typography', () => {
  it('has files to check, so a broken file list cannot pass silently', () => {
    // A `git ls-files` that returns nothing would make every assertion below vacuous.
    // This is the check that the check is running.
    expect(trackedTextFiles().length).toBeGreaterThan(50);
  });

  it('contains no em dashes in any authored file', () => {
    const offences: string[] = [];

    for (const file of trackedTextFiles()) {
      const lines = readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, index) => {
        if (!line.includes(EM_DASH)) return;
        const relative = file.slice(file.indexOf('prove-it-resume/') + 16);
        offences.push(`${relative}:${index + 1}  ${line.trim().slice(0, 100)}`);
      });
    }

    expect(
      offences,
      `Em dashes are not used in this repository. Rewrite the sentence: a colon, a\n` +
        `semicolon, a comma, parentheses, or two sentences will all carry the pause.\n` +
        `The en dash (–) is still fine for numeric ranges.\n\n` +
        offences.slice(0, 40).join('\n'),
    ).toEqual([]);
  });
});
