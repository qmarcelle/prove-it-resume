import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { KNOWN_KEYS } from './deep-link';

/**
 * The registry's list of page-owned query keys, held to the interactions themselves.
 *
 * `buildViewUrl` clears every key in `KNOWN_KEYS` before writing the live state back, so
 * a copied link never carries a stage the reader's own page is not in. A key that exists
 * in an interaction but not in this list would survive that clearing and be handed on as
 * a stale claim: silently, and only for readers who arrived through a deep link, which
 * is the least likely case for anyone to test by hand.
 *
 * So the list is checked against the source rather than maintained beside it.
 */
const INTERACTIONS = join(process.cwd(), 'src/components/interactions');

function usedKeys(): string[] {
  const keys = new Set<string>();

  for (const entry of readdirSync(INTERACTIONS)) {
    if (!entry.endsWith('.tsx')) continue;

    const source = readFileSync(join(INTERACTIONS, entry), 'utf8');
    for (const [, key] of source.matchAll(/useDeepLinkedState\(\s*'([^']+)'/g)) {
      keys.add(key);
    }
  }

  return [...keys].sort();
}

describe('deep-link registry', () => {
  it('knows every key the interactions deep-link', () => {
    const used = usedKeys();

    expect(used.length).toBeGreaterThan(0);
    expect([...KNOWN_KEYS].sort()).toEqual(used);
  });

  it('claims no key that no interaction uses', () => {
    // The other direction, stated separately so a failure says which way it broke: a
    // key listed here but used nowhere would clear a parameter the page does not own.
    const used = new Set(usedKeys());
    for (const key of KNOWN_KEYS) {
      expect(used, `${key} is listed but no interaction uses it`).toContain(key);
    }
  });
});
