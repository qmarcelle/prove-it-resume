/**
 * Vendored icon geometry: Lucide, adapted.
 *
 * Copied from `lucide-react@0.575.0` (ISC; portions derived from Feather, MIT) by
 * extracting each icon's published node array, rather than by hand-transcribing path
 * data. Only the fifteen shapes this site actually uses are here.
 *
 * ISC License. Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2026 as
 * part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide
 * Contributors 2026. https://lucide.dev
 *
 * Why vendored rather than installed: `dependencies` is exactly `next`, `react`, and
 * `react-dom`, and fifteen shapes do not justify making that four. See
 * `docs/decisions/0008-vendored-icon-set.md`. If this set ever passes roughly thirty
 * icons, install the package instead: at that size the maintenance argument flips.
 *
 * The geometry is upstream's, unmodified. The *rendering* is not: `Icon` draws these
 * with square caps and mitre joins instead of Lucide's round ones, because this page has
 * no circles in it and every rule on it terminates flat.
 */
import type { ReactNode } from 'react';

/** Every shape this site can draw. Adding one is a design decision, not a convenience. */
export type IconName =
  | 'arrow-down'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'arrow-up-right'
  | 'check'
  | 'chevron-down'
  | 'chevron-up'
  | 'copy'
  | 'download'
  | 'external-link'
  | 'file-lock'
  | 'file-text'
  | 'mail'
  | 'x';

export const ICON_GEOMETRY: Readonly<Record<IconName, ReactNode>> = {
  'arrow-down': (
    <>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </>
  ),
  'arrow-left': (
    <>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </>
  ),
  'arrow-right': (
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  ),
  'arrow-up': (
    <>
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </>
  ),
  'arrow-up-right': (
    <>
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </>
  ),
  check: (
    <>
      <path d="M20 6 9 17l-5-5" />
    </>
  ),
  'chevron-down': (
    <>
      <path d="m6 9 6 6 6-6" />
    </>
  ),
  'chevron-up': (
    <>
      <path d="m18 15-6-6-6 6" />
    </>
  ),
  copy: (
    <>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </>
  ),
  download: (
    <>
      <path d="M12 15V3" />
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
    </>
  ),
  'external-link': (
    <>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </>
  ),
  'file-lock': (
    <>
      <path d="M4 9.8V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-3" />
      <path d="M14 2v5a1 1 0 0 0 1 1h5" />
      <path d="M9 17v-2a2 2 0 0 0-4 0v2" />
      <rect width="8" height="5" x="3" y="17" rx="1" />
    </>
  ),
  'file-text': (
    <>
      <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
      <path d="M14 2v5a1 1 0 0 0 1 1h5" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </>
  ),
  mail: (
    <>
      <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
      <rect x="2" y="4" width="20" height="16" rx="2" />
    </>
  ),
  x: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
};
