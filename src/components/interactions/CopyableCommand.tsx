'use client';

import { useEffect, useRef, useState } from 'react';
import { ActionIcon } from '@/components/icon/Icon';
import styles from './CopyableCommand.module.css';

type CopyState = 'idle' | 'copied' | 'unavailable';

const LABEL: Record<CopyState, string> = {
  idle: 'COPY',
  copied: 'COPIED',
  unavailable: 'COPY UNAVAILABLE',
};

/** Long enough to be read, short enough that the control returns to its resting word. */
const CONFIRMATION_MS = 2400;

/**
 * A re-check command, and a control that puts it on the clipboard.
 *
 * These commands are the most literal form of evidence on the page: they are the
 * instruction for reproducing a frozen result yourself. Rendering them as inert text and
 * asking the reader to select a wrapped shell line by hand is a small, avoidable tax on
 * exactly the reader this site is built for.
 *
 * The `<code>` keeps its caller's class, because the three places this appears style the
 * command differently and a shared component that flattened them would be a regression
 * dressed as reuse. Only the control is shared.
 *
 * A failed copy says so. The clipboard is unavailable over plain HTTP and can be denied
 * outright, and a control that silently did nothing would be indistinguishable from one
 * that worked, so the word changes to name the failure, and the command stays selectable
 * behind it. There is no success colour here either: the state is carried by the word and
 * by the mark, which is the same rule the rest of the page follows.
 */
export function CopyableCommand({
  command,
  className,
}: {
  command: string;
  /** Applied to the `<code>`, so each caller keeps its own command styling. */
  className?: string;
}) {
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
      await navigator.clipboard.writeText(command);
      setState('copied');
    } catch {
      setState('unavailable');
    }

    timer.current = setTimeout(() => setState('idle'), CONFIRMATION_MS);
  }

  return (
    <>
      <code className={className}>{command}</code>
      <button className={styles.copy} onClick={copy} type="button">
        {LABEL[state]}
        <ActionIcon
          affordance={state === 'copied' ? 'copy-confirmed' : 'copy-command'}
          size={12}
        />
        <span className="visually-hidden"> the re-check command</span>
      </button>
      <span aria-live="polite" className="visually-hidden">
        {state === 'copied' ? 'Command copied to the clipboard.' : ''}
        {state === 'unavailable'
          ? 'The clipboard is unavailable. Select the command above to copy it.'
          : ''}
      </span>
    </>
  );
}
