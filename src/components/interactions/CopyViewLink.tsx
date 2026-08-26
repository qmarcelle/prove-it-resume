'use client';

import { useEffect, useRef, useState } from 'react';
import { ActionIcon } from '@/components/icon/Icon';
import { buildViewUrl } from './deep-link';
import styles from './CopyViewLink.module.css';

type CopyState = 'idle' | 'copied' | 'unavailable';

const LABEL: Record<CopyState, string> = {
  idle: 'COPY THIS VIEW',
  copied: 'LINK COPIED',
  unavailable: 'CLIPBOARD UNAVAILABLE',
};

/** Long enough to be read, short enough that the control returns to its resting word. */
const CONFIRMATION_MS = 2400;

/**
 * The one control that turns the page's current state into an address.
 *
 * Deep-linkable interaction state used to be written into the URL as the reader stepped
 * through it, which meant ordinary reading produced
 * `?interlock=evidence&layer=workspace&decision=comparison#vreko`. The capability was
 * worth keeping and the default was not, so it moved behind an explicit act: this.
 *
 * ## Why it copies the whole page's state, not this panel's
 *
 * A reader shares what they are looking at, and what they are looking at is a page. If
 * they have opened this panel to its receipt and the one above it to its comparison, a
 * link carrying only this panel's stage hands the recipient a different page than the
 * one being described. The anchor is this section's, because that is where the sharer
 * is; the parameters are the surface's.
 *
 * ## Why it sits inside the panel
 *
 * A page-level share control would have to float, and would be a general affordance for
 * a capability that only means something in three specific places. Here it is beside the
 * state it can preserve, in the panel whose stages are the reason to share at all.
 *
 * A failed copy says so. The clipboard is unavailable over plain HTTP and can be denied
 * outright, and a control that silently did nothing would be indistinguishable from one
 * that worked. There is no success colour: the state is carried by the word and the
 * mark, which is the rule the rest of the page follows.
 */
export function CopyViewLink({ anchor }: { anchor: string }) {
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    clearTimeout(timer.current);

    if (!navigator.clipboard) {
      setState('unavailable');
      return;
    }

    try {
      await navigator.clipboard.writeText(buildViewUrl(anchor));
      setState('copied');
    } catch {
      setState('unavailable');
    }

    timer.current = setTimeout(() => setState('idle'), CONFIRMATION_MS);
  }

  return (
    <>
      <button className={styles.copy} onClick={copy} type="button">
        {LABEL[state]}
        <ActionIcon
          affordance={state === 'copied' ? 'copy-confirmed' : 'copy-command'}
          size={12}
        />
        <span className="visually-hidden">
          , a link that reopens this page at its current stages
        </span>
      </button>
      <span aria-live="polite" className="visually-hidden">
        {state === 'copied' ? 'Link copied to the clipboard.' : ''}
        {state === 'unavailable' ? 'The clipboard is unavailable.' : ''}
      </span>
    </>
  );
}
