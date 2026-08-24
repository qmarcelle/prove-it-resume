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
        {cta} ↗<span className="visually-hidden"> — {name}, opens in a new tab</span>
      </a>
    );
  }

  return (
    <span className={variant === 'block' ? styles.unresolvedBlock : styles.unresolved}>
      {variant === 'block' ? UNRESOLVED_LABEL : 'VERIFY BEFORE PUBLISHING'}
      <span className="visually-hidden">
        {' '}
        — no inspectable artifact has been supplied for {name} yet
      </span>
    </span>
  );
}
