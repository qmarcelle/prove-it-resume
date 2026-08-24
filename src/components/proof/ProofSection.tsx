import type { Proof } from '@/lib/types';
import styles from './ProofSection.module.css';

/**
 * Shared shell for a proof section: eyebrow, masthead, and the two-column body.
 *
 * The three proofs are deliberately *not* forced into one template. They make different
 * arguments and earn different layouts — a shipped system, a three-layer standard, and
 * a controlled experiment do not want the same shape. What is shared is what should be:
 * the header, the column structure, and the labelled-field and list primitives, so the
 * page reads as one document rather than three.
 */
export function ProofSection({
  proof,
  children,
}: {
  proof: Proof;
  children: React.ReactNode;
}) {
  return (
    <section
      className={styles.section}
      id={proof.sectionId}
      aria-labelledby={`${proof.id}-title`}
    >
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{proof.eyebrow}</p>
        <div className={styles.masthead}>
          <h2 className={styles.title} id={`${proof.id}-title`}>
            {proof.title}
          </h2>
          <p className={styles.thesis}>{proof.thesis}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

export function ProofColumns({ children }: { children: React.ReactNode }) {
  return <div className={styles.columns}>{children}</div>;
}

export function ProofProse({ children }: { children: React.ReactNode }) {
  return <div className={styles.prose}>{children}</div>;
}

export function ProofAside({ children }: { children: React.ReactNode }) {
  return <div className={styles.aside}>{children}</div>;
}

export function ProofField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <p className={styles.fieldBody}>{children}</p>
    </div>
  );
}

export function ProofTags({ label, tags }: { label: string; tags: readonly string[] }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <ul className={styles.tags}>
        {tags.map((tag) => (
          <li className={styles.tag} key={tag}>
            {tag}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProofList({ label, items }: { label: string; items: readonly string[] }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
