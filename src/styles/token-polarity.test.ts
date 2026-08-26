import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Polarity safety for the token layer.
 *
 * ## The defect this generalises
 *
 * `.verdictHolds` filled itself with `--color-ink` and set its label in
 * `--color-inverse-ink`. That is two independent guesses about which end of the scale
 * is dark, and both of them are true on a light page. The Lit Work Surface remaps
 * `--color-*` at the composition root so every component inverts without knowing it —
 * and there `--color-ink` *is* the light step, so fill and label resolved to the same
 * value. The chip rendered as a blank rectangle with its word painted on itself. The
 * text was in the DOM the whole time, so nothing that reads markup could have caught it.
 *
 * ## The rule
 *
 * A token that names text is not a background. When a rule fills a surface, its fill
 * pairs either with a *ground* token — `--color-canvas`, `--color-surface*`,
 * `--color-inverse-bg` — which inverts alongside it, or with a purpose-named pair such
 * as `--color-action-{fill,ink}` or `--color-verdict-held-{bg,fg}`, which a surface has
 * to answer deliberately. What it must never pair with is a second ink token, because
 * two ink tokens are free to converge and no rule anywhere says they may not.
 *
 * Filling with an ink token is still allowed on its own: `--color-ink` behind
 * `--color-canvas` text is a solid chip that survives inversion, because the ground
 * token moves with the palette. It is the ink-on-ink pairing that is unsound.
 *
 * ## What this checks
 *
 * Every CSS module, block by block: a block that sets `background` from the ink family
 * and `color` from the ink family fails, and names the file and the block. That is a
 * structural check rather than a rendering one, so it holds for palettes that do not
 * exist yet. `interactions.spec.ts` covers the other half — the resolved colours on the
 * served page in both palettes — because a structural rule cannot prove legibility.
 */

const STYLE_ROOT = join(process.cwd(), 'src');

/**
 * Tokens whose name says "this is type". `--color-meta*` is included because it is the
 * metadata ink step under a different name, and `--lens-text*` because a component may
 * reach past the remapping for the dark scale directly.
 */
const INK_TOKEN =
  /var\(--(?:color-ink[a-z-]*|color-inverse-ink[a-z-]*|color-meta[a-z-]*|lens-text[a-z-]*)\)/;

function cssModules(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return cssModules(path);
    return path.endsWith('.css') ? [path] : [];
  });
}

/**
 * Declaration blocks, as `{ selector, body }`. Comments go first, so a rationale note
 * above a rule neither hides a declaration nor turns up inside a reported selector.
 * Good enough for these stylesheets: none of them nest.
 */
function blocks(css: string): { selector: string; body: string }[] {
  const out: { selector: string; body: string }[] = [];
  const pattern = /([^{}]+)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(css.replace(/\/\*[\s\S]*?\*\//g, ' ')))) {
    out.push({ selector: match[1].trim().replace(/\s+/g, ' '), body: match[2] });
  }
  return out;
}

/** The last winning value for a property inside one block. */
function declaration(body: string, property: string): string | null {
  const pattern = new RegExp(`(?:^|;)\\s*${property}\\s*:([^;]*)`, 'g');
  let value: string | null = null;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(body))) value = match[1].trim();
  return value;
}

describe('token polarity', () => {
  const files = cssModules(STYLE_ROOT);

  it('finds the stylesheets it is meant to scan', () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it('never pairs an ink fill with an ink label', () => {
    const offences: string[] = [];

    for (const file of files) {
      const css = readFileSync(file, 'utf8');

      for (const { selector, body } of blocks(css)) {
        const background =
          declaration(body, 'background') ?? declaration(body, 'background-color');
        const colour = declaration(body, 'color');
        if (!background || !colour) continue;
        if (!INK_TOKEN.test(background) || !INK_TOKEN.test(colour)) continue;

        offences.push(
          `${file.replace(`${process.cwd()}/`, '')} — ${selector} { background: ${background}; color: ${colour} }`,
        );
      }
    }

    expect(
      offences,
      [
        'An ink token is being used as a background behind ink-token text.',
        'Two ink tokens may resolve to the same value on an inverted surface, and the',
        'text disappears. Pair the fill with a ground token, or introduce a purpose-named',
        `{bg,fg} pair the way --color-verdict-* does.\n\n${offences.join('\n')}`,
      ].join(' '),
    ).toEqual([]);
  });
});
