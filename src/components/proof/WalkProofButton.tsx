'use client';

import { useProofNav } from './ProofNavProvider';

/**
 * The one interactive element inside the otherwise server-rendered hero and final CTA.
 *
 * Isolating it here is the point: the hero stays a Server Component and ships no
 * JavaScript for its heading, copy, or links. Only this button crosses the boundary.
 */
export function WalkProofButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { startGuided } = useProofNav();

  return (
    <button type="button" className={className} onClick={startGuided}>
      {children}
    </button>
  );
}
