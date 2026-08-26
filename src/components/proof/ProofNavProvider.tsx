'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PROOF_STEPS, SCROLL_OFFSET, type ProofStep } from '@/lib/proof-steps';

/**
 * The only shared client state in the application: which proof stage is on screen, and
 * whether the reader has entered guided mode.
 *
 * It lives in a provider rather than in the page because three separate, distant
 * components need it: the sticky rail, the hero's "Walk the proof" button, and the
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

/**
 * ## Who owns the active stage
 *
 * Two things move it, and they used to fight.
 *
 * `goTo` starts a scroll and sets the index optimistically. The IntersectionObserver
 * sets it from whatever section is at reading position. Both are correct on their own;
 * together, with `behavior: 'smooth'`, they were not; the observer kept firing for
 * every section the page glided *past*, so a few hundred milliseconds after a click the
 * index had been overwritten by a section the reader was merely travelling through.
 *
 * That was not cosmetic. `next` and `previous` are `goTo(activeIndex ± 1)`, so a second
 * click computed its target from the clobbered value: NEXT, NEXT, PREV landed on stage
 * one instead of stage two, deterministically, for anyone not running reduced motion.
 *
 * The rule now: **a programmatic navigation owns the index until its scroll settles.**
 *
 * - `goTo` commits its target immediately and takes ownership.
 * - While owned, observer callbacks are dropped. A section crossed in transit is not a
 *   destination and must not be recorded as one.
 * - Ownership ends when the scroll settles: position reached, or position stopped
 *   changing: never on a timer, and never permanently. Ordinary scrolling is observed
 *   exactly as before, because outside a programmatic scroll nothing is owned.
 * - A fresh `goTo` supersedes an in-flight one, so rapid clicks chain from the logical
 *   target rather than from wherever the page happens to be mid-glide.
 *
 * Reduced motion takes the identical path; its scroll simply settles on the first frame.
 * Smooth scrolling is untouched: the bug was never the animation, it was reading state
 * from a page that had not arrived yet.
 */
export function ProofNavProvider({
  steps = PROOF_STEPS,
  children,
}: {
  /**
   * The stages this surface actually renders, in the order it renders them.
   *
   * A prop rather than the module constant because an application surface composes a
   * different page: it drops the operating thesis, adds its own sections, and reorders
   * the proofs. The rail is a map of the page in front of the reader, so a rail that
   * always listed the durable six would be pointing at sections that are somewhere else
   * or not there at all.
   */
  steps?: readonly ProofStep[];
  children: React.ReactNode;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [guided, setGuided] = useState(false);

  /*
   * The logical index, readable synchronously.
   *
   * `next` and `previous` derive a target from the current stage, and two clicks can
   * land in the same render. Reading React state there would compute the second target
   * from the value the first click has not committed yet, so the ref is the source of
   * truth for arithmetic and the state is what renders.
   */
  const activeIndexRef = useRef(0);

  /** Non-null while a programmatic scroll owns the index. Calling it hands ownership back. */
  const releaseRef = useRef<(() => void) | null>(null);

  const commit = useCallback((index: number) => {
    activeIndexRef.current = index;
    setActiveIndex(index);
  }, []);

  /*
   * The stage at reading position, computed rather than observed.
   *
   * Deliberately the same band the observer uses: `rootMargin: -45% 0px -50% 0px`
   * shrinks the root to the slice between 45% and 50% of the viewport height. It is
   * stated twice because it is needed in two modes: as a live callback, and as a
   * question that can be asked of a page that has stopped moving and will therefore
   * never fire another intersection event.
   */
  const readingPositionIndex = useCallback(() => {
    const bandTop = window.innerHeight * 0.45;
    const bandBottom = window.innerHeight * 0.5;

    for (const [index, step] of steps.entries()) {
      const element = document.getElementById(step.id);
      if (!element) continue;
      const box = element.getBoundingClientRect();
      if (box.top < bandBottom && box.bottom > bandTop) return index;
    }
    return -1;
  }, [steps]);

  /*
   * Hold the index until the page stops moving, then decide who was right.
   *
   * Settlement is measured from the scroll position, never from a duration: a timer
   * here would be a guess about animation length and would rot the moment the page got
   * taller. The watcher ends when the target is reached, or when the position stops
   * changing, or when the reader takes the scroll over themselves.
   *
   * **The programmatic target wins only if the page actually arrived at it.** That is
   * the whole of the ownership rule, and the second half matters as much as the first:
   *
   * - Arrived: the reader is looking at the section they asked for, so the committed
   *   target stands and nothing is recomputed.
   * - Did not arrive: clamped at the foot of the document, or overtaken by a wheel, a
   *   touch, or another script's `scrollTo`: then the target is a statement about a
   *   place the page is not, and the reading position is the truth. It is recomputed
   *   directly, because a page that has stopped moving will not emit another
   *   intersection event to correct it with.
   *
   * Handing over on `wheel` and `touchstart` is what keeps the rail live under the
   * reader's own scrolling instead of frozen until the watcher notices. `keydown` is
   * pointedly not in that list: Enter on the dock's own NEXT button would hand over
   * mid-glide, resync the index to a section being travelled through, and hand the very
   * bug this file exists to remove back to keyboard users. Arrow-key scrolling is caught
   * by the stall check a few frames later instead.
   */
  const ownUntilSettled = useCallback(
    (target: number) => {
      releaseRef.current?.();

      let frame = 0;
      let previousY = window.scrollY;
      let still = 0;

      /*
       * Two ways to stop owning, and they are not the same.
       *
       * `teardown` gives ownership back and says nothing about where the reader is. It
       * is what a *superseding* navigation gets: the next `goTo` has already committed
       * its own target, and letting the outgoing watcher resync on its way out would
       * overwrite that target with a section the page is only passing through, which is
       * the original bug, reintroduced through the back door.
       *
       * `settle` is the end of a navigation that was not replaced, and it is the only
       * path allowed to correct the index.
       */
      const teardown = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener('wheel', settle);
        window.removeEventListener('touchstart', settle);
        releaseRef.current = null;
      };

      function settle() {
        teardown();
        if (Math.abs(window.scrollY - target) <= 2) return;
        const index = readingPositionIndex();
        if (index >= 0) commit(index);
      }

      const watch = () => {
        if (Math.abs(window.scrollY - target) <= 2) return settle();
        // Five frames without movement: finished, clamped, or taken over.
        still = window.scrollY === previousY ? still + 1 : 0;
        if (still >= 5) return settle();
        previousY = window.scrollY;
        frame = requestAnimationFrame(watch);
      };

      releaseRef.current = teardown;
      window.addEventListener('wheel', settle, { passive: true });
      window.addEventListener('touchstart', settle, { passive: true });
      frame = requestAnimationFrame(watch);
    },
    [commit, readingPositionIndex],
  );

  // A provider unmounting mid-glide must not leave a frame loop running.
  useEffect(() => () => releaseRef.current?.(), []);

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
        // A programmatic scroll is in flight and owns the index. Everything crossing the
        // band right now is scenery, not a destination.
        if (releaseRef.current) return;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = steps.findIndex((step) => step.id === entry.target.id);
          if (index >= 0) commit(index);
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );

    for (const step of steps) {
      const element = document.getElementById(step.id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [steps, commit]);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(steps.length - 1, index));
      const element = document.getElementById(steps[clamped].id);
      if (!element) return;

      const top = element.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;

      /*
       * Order matters. Ownership is taken before the scroll starts, because observer
       * callbacks are delivered asynchronously and one queued by this scroll's very
       * first frame would otherwise arrive while the index was still unguarded.
       *
       * The index is committed rather than left to the observer, so the rail answers the
       * click even when the scroll is interrupted or the target is already in view.
       */
      commit(clamped);
      ownUntilSettled(top);
      window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    },
    [steps, commit, ownUntilSettled],
  );

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
      steps,
      activeIndex,
      guided,
      goTo,
      startGuided,
      exitGuided: () => setGuided(false),
      // From the logical index, not the rendered one: two clicks can share a render.
      next: () => goTo(activeIndexRef.current + 1),
      previous: () => goTo(activeIndexRef.current - 1),
    }),
    [steps, activeIndex, guided, goTo, startGuided],
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
