'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { PROOF_STEPS, SCROLL_OFFSET, type ProofStep } from '@/lib/proof-steps';

/**
 * The only shared client state in the application: which proof stage is on screen, and
 * whether the reader has entered guided mode.
 *
 * It lives in a provider rather than in the page because three separate, distant
 * components need it — the sticky rail, the hero's "Walk the proof" button, and the
 * fixed guided dock. Everything else on the page stays a Server Component; the provider
 * renders `children` untouched, so passing server-rendered sections through it does not
 * pull them across the boundary.
 */
type ProofNavValue = {
  steps: readonly ProofStep[];
  activeIndex: number;
  guided: boolean;
  goTo: (index: number) => void;
  startGuided: () => void;
  exitGuided: () => void;
  next: () => void;
  previous: () => void;
};

const ProofNavContext = createContext<ProofNavValue | null>(null);

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function ProofNavProvider({ children }: { children: React.ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [guided, setGuided] = useState(false);

  /*
   * Active-section tracking, ported from the export's componentDidMount. The
   * rootMargin band is carried over unchanged: it treats the middle ~5% of the viewport
   * as "here", so the rail changes when a section reaches reading position rather than
   * when its top edge first appears.
   *
   * Observing is a progressive enhancement. Without JavaScript the sections are still
   * ordinary anchor targets and the in-page links still work.
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = PROOF_STEPS.findIndex((step) => step.id === entry.target.id);
          if (index >= 0) setActiveIndex(index);
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );

    for (const step of PROOF_STEPS) {
      const element = document.getElementById(step.id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(PROOF_STEPS.length - 1, index));
    const element = document.getElementById(PROOF_STEPS[clamped].id);
    if (!element) return;

    const top = element.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });

    // Set immediately rather than waiting for the observer, so the rail responds to the
    // click even if the scroll is interrupted or the target is already in view.
    setActiveIndex(clamped);
  }, []);

  /*
   * Guided mode adds controls; it does not take the page over. Scrolling, anchors, and
   * every other affordance keep working while it is on, and leaving it changes nothing
   * about where the reader is.
   */
  const startGuided = useCallback(() => {
    setGuided(true);
    goTo(0);
  }, [goTo]);

  const value = useMemo<ProofNavValue>(
    () => ({
      steps: PROOF_STEPS,
      activeIndex,
      guided,
      goTo,
      startGuided,
      exitGuided: () => setGuided(false),
      next: () => goTo(activeIndex + 1),
      previous: () => goTo(activeIndex - 1),
    }),
    [activeIndex, guided, goTo, startGuided],
  );

  return <ProofNavContext value={value}>{children}</ProofNavContext>;
}

export function useProofNav(): ProofNavValue {
  const value = useContext(ProofNavContext);
  if (!value) {
    throw new Error('useProofNav must be used within a ProofNavProvider');
  }
  return value;
}
