import { ConceptMark } from '@/components/concept/ConceptMark';
import { ActionIcon } from '@/components/icon/Icon';
import { affordanceForCta } from '@/components/icon/semantics';
import { UNRESOLVED_LABEL, resolveEvidence } from '@/lib/evidence';
import styles from './EvidenceLink.module.css';

/**
 * The single place an evidence call to action can be rendered.
 *
 * There is no prop that lets a caller supply a raw href, and no way to force the
 * resolved branch. If the underlying record is not verified with a destination, this
 * renders a stated gap instead of a link — which is the whole evidence-integrity rule,
 * enforced by the type system rather than by reviewer vigilance.
 */
export function EvidenceLink({
  reference,
  cta = 'INSPECT',
  variant = 'inline',
}: {
  reference: { href?: string; verified: boolean; title?: string; label?: string };
  cta?: string;
  /**
   * `inline` is the quiet per-row marker. `block` is the bordered statement, for the
   * one place in a block where the gap is stated rather than repeated — a dashed box on
   * every row of every panel stops reading as restraint and starts reading as noise.
   */
  variant?: 'inline' | 'block';
}) {
  const resolved = resolveEvidence(reference);
  const name = reference.title ?? reference.label ?? 'this evidence';

  if (resolved.status === 'resolved') {
    return (
      <a
        className={styles.link}
        href={resolved.href}
        target="_blank"
        rel="noreferrer noopener"
      >
        {cta}
        {/*
         * The mark predicts what is on the other side: a boxed arrow for an artifact to
         * inspect, a page for a document to read. Both were `↗`, which promised only
         * "somewhere else" — and shared that glyph with visiting a profile.
         */}
        <ActionIcon affordance={affordanceForCta(cta)} size={12} />
        <span className="visually-hidden"> — {name}, opens in a new tab</span>
      </a>
    );
  }

  return (
    <span className={variant === 'block' ? styles.unresolvedBlock : styles.unresolved}>
      {/*
       * The stated gap gets a mark, and pointedly not an action icon: there is nothing
       * here to do. It is two of the hero's nodes, still dashed, still off the axis and
       * connected to nothing — the same shape the composition opens on.
       */}
      {variant === 'block' ? <ConceptMark name="unresolved" /> : null}
      {variant === 'block' ? UNRESOLVED_LABEL : 'VERIFY BEFORE PUBLISHING'}
      <span className="visually-hidden">
        {' '}
        — no inspectable artifact has been supplied for {name} yet
      </span>
    </span>
  );
}
