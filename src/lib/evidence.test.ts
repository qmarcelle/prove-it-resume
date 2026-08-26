import { describe, expect, it } from 'vitest';
import {
  countResolved,
  evidenceKindLabel,
  isResolved,
  resolveEvidence,
} from './evidence';

/**
 * The evidence-integrity rule is the load-bearing invariant of this site: no call to
 * action without a real artifact behind it. These tests pin the exact conditions, because
 * a regression here would not look like a bug; it would look like a working link.
 */
describe('resolveEvidence', () => {
  it('resolves only when a destination is present and verified', () => {
    expect(resolveEvidence({ href: 'https://example.com/spec', verified: true })).toEqual(
      { status: 'resolved', href: 'https://example.com/spec' },
    );
  });

  it('is unresolved when the destination is unverified, however plausible', () => {
    expect(
      resolveEvidence({ href: 'https://example.com/spec', verified: false }),
    ).toEqual({ status: 'unresolved' });
  });

  it('is unresolved when verified but no destination was supplied', () => {
    expect(resolveEvidence({ verified: true })).toEqual({ status: 'unresolved' });
  });

  it('is unresolved when neither is present', () => {
    expect(resolveEvidence({ verified: false })).toEqual({ status: 'unresolved' });
  });

  it('treats an empty href as no destination', () => {
    expect(resolveEvidence({ href: '', verified: true })).toEqual({
      status: 'unresolved',
    });
  });
});

describe('countResolved', () => {
  it('reports resolved and total honestly, including all-unresolved', () => {
    expect(
      countResolved([
        { id: 'a', kind: 'source', title: 'A', verified: false },
        { id: 'b', kind: 'source', title: 'B', verified: false },
      ]),
    ).toEqual({ resolved: 0, total: 2 });
  });

  it('counts a mixed set', () => {
    expect(
      countResolved([
        { id: 'a', kind: 'source', title: 'A', href: 'https://e.com/a', verified: true },
        { id: 'b', kind: 'source', title: 'B', verified: false },
      ]),
    ).toEqual({ resolved: 1, total: 2 });
  });
});

describe('evidenceKindLabel', () => {
  it('labels every kind in the vocabulary, boundary included', () => {
    expect(evidenceKindLabel('specification')).toBe('SPECIFICATION');
    expect(evidenceKindLabel('boundary')).toBe('BOUNDARY');
    expect(evidenceKindLabel('research')).toBe('RESEARCH');
  });
});

describe('isResolved', () => {
  it('agrees with resolveEvidence', () => {
    expect(isResolved({ href: 'https://e.com', verified: true })).toBe(true);
    expect(isResolved({ href: 'https://e.com', verified: false })).toBe(false);
  });
});
