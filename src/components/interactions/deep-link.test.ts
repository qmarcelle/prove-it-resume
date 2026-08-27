import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { KNOWN_KEYS } from './deep-link';
import { DISCLOSURE_KEYS } from '@/lib/disclosure';
import { linearApplication } from '@/content/applications/linear';

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
 *
 * ## Two ways a key reaches the hook
 *
 * The three stepped interactions name their key inline, so they are found by reading
 * the source. `ProgressiveDisclosure` is one component mounted once per section and
 * takes its key as a prop, so its keys cannot be read from its own file: they come from
 * `DISCLOSURE_KEYS`, and the second half of this suite holds *that* map against the
 * sections that actually reference it.
 */
const COMPONENTS = join(process.cwd(), 'src/components');
const INTERACTIONS = join(COMPONENTS, 'interactions');

/** Keys passed to the hook as a string literal, which is every stepped interaction. */
function literalKeys(): string[] {
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

/** Every `.tsx` under `src/components`, recursively. */
function componentSources(dir: string = COMPONENTS): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return componentSources(path);
    return entry.name.endsWith('.tsx') && !entry.name.endsWith('.test.tsx') ? [path] : [];
  });
}

/**
 * The sections that ask `DISCLOSURE_KEYS` for a key.
 *
 * Sections index the map with their own id as a literal rather than being handed a key
 * computed from `step.id`, precisely so this is readable from the source. The dynamic
 * version would be shorter and would make both directions of the check below
 * unenforceable.
 */
function disclosingSections(): string[] {
  const ids = new Set<string>();

  for (const path of componentSources()) {
    const source = readFileSync(path, 'utf8');
    for (const [, id] of source.matchAll(/DISCLOSURE_KEYS\['([^']+)'\]/g)) ids.add(id);
  }

  return [...ids].sort();
}

describe('deep-link registry', () => {
  it('knows every key the interactions deep-link', () => {
    const used = [
      ...new Set([...literalKeys(), ...Object.values(DISCLOSURE_KEYS)]),
    ].sort();

    expect(used.length).toBeGreaterThan(0);
    expect([...KNOWN_KEYS].sort()).toEqual(used);
  });

  it('claims no key that no interaction uses', () => {
    // The other direction, stated separately so a failure says which way it broke: a
    // key listed here but used nowhere would clear a parameter the page does not own.
    const used = new Set([...literalKeys(), ...Object.values(DISCLOSURE_KEYS)]);
    for (const key of KNOWN_KEYS) {
      expect(used, `${key} is listed but no interaction uses it`).toContain(key);
    }
  });

  it('gives every key a distinct query parameter', () => {
    // A disclosure key colliding with a stepped interaction's would make two unrelated
    // states share one parameter, and the page would honour whichever mounted last.
    expect(new Set(KNOWN_KEYS).size).toBe(KNOWN_KEYS.length);
  });
});

describe('disclosure keys', () => {
  it('maps exactly the sections that render a disclosure', () => {
    // Both directions at once: a section that discloses without a key would collide on
    // whatever key it borrowed, and a key for a section that no longer discloses would
    // clear a parameter nothing owns.
    expect(disclosingSections()).toEqual(Object.keys(DISCLOSURE_KEYS).sort());
  });

  it('names sections the application page plan actually has', () => {
    /*
     * A key is part of the page's address surface, so a section id that has drifted out
     * of the plan should fail here rather than quietly becoming an unreachable link
     * somebody has already pasted into a thread.
     */
    const planned = new Set(linearApplication.pagePlan.map((section) => section.id));
    for (const id of Object.keys(DISCLOSURE_KEYS)) {
      expect(
        planned,
        `${id} has a disclosure key but no place in the page plan`,
      ).toContain(id);
    }
  });
});
