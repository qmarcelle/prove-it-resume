'use client';

import { useProofNav } from './ProofNavProvider';
import { ActionIcon } from '@/components/icon/Icon';
import type { Affordance } from '@/components/icon/semantics';
import type { IconSize } from '@/components/icon/Icon';

/**
 * The one interactive element inside the otherwise server-rendered hero and final CTA.
 *
 * Isolating it here is the point: the hero stays a Server Component and ships no
 * JavaScript for its heading, copy, or links. Only this button crosses the boundary.
 *
 * The two placements make different promises and so carry different marks. In the hero
 * this starts a sequence and points forward; in the closing band the reader has already
 * reached the bottom, so walking again sends them back up the page. One glyph for both
 * would have said "something happens".
 */
export function WalkProofButton({
  className,
  affordance,
  iconSize = 14,
  children,
}: {
  className?: string;
  affordance: Affordance;
  iconSize?: IconSize;
  children: React.ReactNode;
}) {
  const { startGuided } = useProofNav();

  return (
    <button type="button" className={className} onClick={startGuided}>
      {children}
      <ActionIcon affordance={affordance} size={iconSize} />
    </button>
  );
}
