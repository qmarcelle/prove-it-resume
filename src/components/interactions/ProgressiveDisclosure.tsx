'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import { ActionIcon } from '@/components/icon/Icon';
import { useDeepLinkedState } from './useDeepLinkedState';
import styles from './ProgressiveDisclosure.module.css';

/** One curiosity path: the question, and the material that answers it. */
export type DisclosurePath = {
  id: string;
  /**
   * The amber invitation. It states the question the path answers, because a reader
   * deciding whether to spend attention needs to know what they are buying. `Learn
   * more` is the failure this type exists to discourage.
   *
   * Carries no trailing arrow glyph. The direction writes these as `... →`, but on this
   * site the arrow is an `ActionIcon` named by affordance rather than a character in a
   * sentence, so the mark is supplied below and the copy stays a question.
   */
  invitation: string;
  /** The mono label the opened panel announces itself with. */
  label: string;
  content: React.ReactNode;
  /**
   * Query keys belonging to interactions *inside* this path, whose presence in an
   * incoming address should open it.
   *
   * This is what keeps already-shared links working. `/linear?interlock=evidence` was a
   * valid address before this section had a disclosure, and it names a stage of the
   * counterfactual, which now lives behind a question. Without this the parameter would
   * still be honoured by the control that owns it and the control would not be on the
   * page, so the link would resolve to an orientation layer and silently drop the state
   * it was sent to show.
   *
   * The section's own key still wins where both are present: it is the more specific
   * statement about what this section should be showing.
   */
  revealedBy?: readonly string[];
};

/**
 * The application surface's one disclosure grammar.
 *
 * ## Why one primitive rather than five
 *
 * Five sections each needed the same move: say the point in twenty seconds, then let a
 * reader who became curious open the evidence. Written per section that becomes five
 * widgets with five keyboard contracts and five ideas about what the URL should say,
 * which is the "accordion forest" the direction rules out. The sections differ in what
 * they are arguing, not in how a reader asks for more, so the copy is per section and
 * the behaviour is here.
 *
 * ## Orientation is not inside this component
 *
 * Deliberately. Everything a reader must understand stays ordinary document content in
 * the section above; this renders only the invitations and whatever they open. So the
 * default state of every section is fully readable with this component inert, and a
 * failure here costs the reader depth rather than the point.
 *
 * ## State, and where it is allowed to show
 *
 * Each instance owns one query key, from `DISCLOSURE_KEYS`. One shared key across five
 * mounted sections would not work: every instance applies the incoming URL on mount, and
 * the four whose paths do not match the value would publish it as absent and clobber the
 * one that does. Separate keys also mean a copied link reproduces *every* open panel
 * rather than whichever section mounted last.
 *
 * Browsing does not write to the URL. That is `useDeepLinkedState`'s rule, kept here:
 * opening a path is a state change and only `COPY THIS VIEW` turns it into an address.
 *
 * ## Focus, and the one case where moving it is wrong
 *
 * Opening by click or key moves focus into the panel, so a keyboard reader lands on what
 * they asked for rather than tabbing through it. Closing returns focus to the invitation
 * that opened it, which is what makes requirement "return without losing your place"
 * true for a keyboard as well as for a mouse.
 *
 * Arriving *through* a deep link deliberately does not move focus. The panel is already
 * the reason the reader is on the page, and stealing focus on load would move a screen
 * reader off the document start and skip the heading that says what page this is.
 *
 * No animation is used, so there is nothing for reduced motion to suppress and no state
 * a reader can only perceive by having watched it change.
 */
export function ProgressiveDisclosure({
  queryKey,
  paths,
  label = 'Questions this section can answer',
}: {
  queryKey: string;
  paths: readonly DisclosurePath[];
  /** Names the invitation group for a screen reader. */
  label?: string;
}) {
  const closed = 'none';
  const [openId, setOpenId] = useDeepLinkedState(queryKey, closed, (raw) =>
    paths.some((path) => path.id === raw),
  );

  const active = paths.find((path) => path.id === openId);
  const panelId = useId();
  const headingId = `${panelId}-label`;

  const panel = useRef<HTMLDivElement>(null);
  const invitations = useRef(new Map<string, HTMLButtonElement>());
  /*
   * Whether the current state came from this reader pressing something. Focus follows
   * intent, and an incoming deep link is not intent to move the caret.
   */
  const moveFocus = useRef(false);

  /*
   * `paths` is rebuilt on every render by the section composing it, so it is read
   * through a ref below rather than listed as a dependency: as an effect dependency it
   * would re-run the reveal on every render and reopen a path the reader just closed.
   */
  const current = useRef(paths);
  useEffect(() => {
    current.current = paths;
  });

  /*
   * Open the path that contains whichever nested interaction the address names.
   *
   * Runs on arrival and on browser navigation, and defers to this section's own key
   * whenever the address carries one.
   */
  useEffect(() => {
    const reveal = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.has(queryKey)) return;

      const match = current.current.find((path) =>
        path.revealedBy?.some((nested) => params.has(nested)),
      );
      if (match) setOpenId(match.id);
    };

    reveal();
    window.addEventListener('popstate', reveal);
    return () => window.removeEventListener('popstate', reveal);
  }, [queryKey, setOpenId]);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    if (active) panel.current?.focus();
  }, [active]);

  const toggle = useCallback(
    (id: string) => {
      const next = openId === id ? closed : id;
      moveFocus.current = next !== closed;
      setOpenId(next);
      if (next === closed) invitations.current.get(id)?.focus();
    },
    [openId, setOpenId],
  );

  const close = useCallback(() => {
    const returnTo = openId;
    moveFocus.current = false;
    setOpenId(closed);
    invitations.current.get(returnTo)?.focus();
  }, [openId, setOpenId]);

  return (
    <div className={styles.root}>
      <ul aria-label={label} className={styles.invitations}>
        {paths.map((path) => {
          const open = path.id === openId;
          return (
            <li key={path.id}>
              <button
                aria-controls={open ? panelId : undefined}
                aria-expanded={open}
                className={styles.invitation}
                data-open={open ? '' : undefined}
                onClick={() => toggle(path.id)}
                ref={(node) => {
                  if (node) invitations.current.set(path.id, node);
                  else invitations.current.delete(path.id);
                }}
                type="button"
              >
                <span className={styles.invitationText}>{path.invitation}</span>
                <ActionIcon
                  affordance={open ? 'collapse-in-place' : 'expand-in-place'}
                  size={12}
                />
              </button>
            </li>
          );
        })}
      </ul>

      {active ? (
        <div
          aria-labelledby={headingId}
          className={styles.panel}
          id={panelId}
          ref={panel}
          role="group"
          tabIndex={-1}
        >
          <div className={styles.panelHead}>
            <h3 className={styles.panelLabel} id={headingId}>
              {active.label}
            </h3>
            <button className={styles.close} onClick={close} type="button">
              Close and return to the overview
              <ActionIcon affordance="collapse-in-place" size={12} />
            </button>
          </div>

          {active.content}
        </div>
      ) : null}
    </div>
  );
}
