import { ChapterMark } from './ChapterMark';
import { SectionHead, sectionFrameClass } from '@/components/section/SectionFrame';
import type { Proof, SurfaceStep } from '@/lib/types';
import styles from './ProofSection.module.css';

/**
 * Shared shell for a proof section, and now only the shell.
 *
 * The three proofs were never forced into one template; the redesign takes that
 * further. Each section is split into a *scan layer* (the argument in one pass) and a
 * *proof layer* (the diagram, the run, the artifacts), and each gets its own spatial
 * grammar: containment for Vreko, causality for Repository Intelligence, measurement
 * for Interlock. What the shell still guarantees is the part that must not vary: the
 * section boundary, the scroll target, the measure, and the accessible name.
 *
 * The masthead moved out. It used to live here as eyebrow + title + thesis, which
 * fixed every proof to the same opening rhythm; sections now compose their own
 * `ChapterMark`, and this only promises that whatever renders the title uses the
 * `titleId` this element points `aria-labelledby` at.
 *
 * `tone` inverts the section for Repository Intelligence. It is a prop rather than a
 * per-section stylesheet because the contrast budget is a page-level decision: the
 * redesign allows exactly one dark chapter among the proofs, and a single switch is
 * what makes a second one an obvious edit rather than an accident.
 */
export function ProofSection({
  proof,
  tone = 'light',
  step,
  children,
}: {
  proof: Proof;
  tone?: 'light' | 'dark';
  /**
   * The page-plan step this proof was placed as, on a surface that has a plan.
   *
   * When present it replaces the shell's own rhythm with the surface's normalised
   * section frame, so a proof sits in the same geometry as the editorial sections
   * around it rather than in the proof shell's. Absent on `/`, where the six sections
   * are the page and the shell's rhythm *is* the surface's.
   */
  step?: SurfaceStep;
  children: React.ReactNode;
}) {
  const framed = Boolean(step);

  return (
    <section
      className={
        framed
          ? sectionFrameClass(step)
          : `${styles.section} ${tone === 'dark' ? styles.dark : ''}`
      }
      id={step ? step.id : proof.sectionId}
      aria-labelledby={`${proof.id}-title`}
    >
      <div className={framed ? styles.framedInner : styles.inner}>{children}</div>
    </section>
  );
}

/**
 * A proof's chapter furniture, sourced from wherever the surface keeps its sequence.
 *
 * This is the seam that removed the defect. A proof section used to state its own
 * position twice over (`stage={vreko.stage}` and `label="PROOF ONE"`) and both were
 * facts about `/`. Rendered on an application surface that reorders the proofs, they
 * were simply wrong: Vreko printed `02 · PROOF ONE` in sixth position while the rail
 * beside it counted `06`.
 *
 * With a `step` the section takes its number and its eyebrow from the page plan and
 * states nothing. Without one it keeps the durable chapter mark, which is still the
 * right furniture for the page the durable stages describe.
 */
export function ProofChapter({
  proof,
  step,
  label,
  meta,
  orientation = 'horizontal',
  tone = 'light',
  title,
  lead,
}: {
  proof: Proof;
  step?: SurfaceStep;
  /** The durable chapter label. Used only when no plan step is supplied. */
  label: string;
  meta?: string;
  orientation?: 'horizontal' | 'inline' | 'vertical';
  tone?: 'light' | 'dark';
  /**
   * Framing overrides for a surface that enters this proof through a question rather
   * than through its name.
   *
   * Copy only, and only where a page plan has already framed the section. The proof's
   * own title and thesis remain the durable record and are what `/` renders; an
   * application surface may ask the same evidence a different opening question, which
   * is a projection, not a second claim.
   */
  title?: string;
  lead?: string;
}) {
  if (step) {
    return (
      <SectionHead
        step={step}
        title={title ?? proof.title}
        titleId={`${proof.id}-title`}
        lead={lead ?? proof.thesis}
      />
    );
  }

  return (
    <ProofMasthead>
      <ChapterMark
        stage={proof.stage}
        label={label}
        meta={meta}
        title={proof.title}
        titleId={`${proof.id}-title`}
        orientation={orientation}
        tone={tone}
      />
      <ProofThesis>{proof.thesis}</ProofThesis>
    </ProofMasthead>
  );
}

/**
 * The signature block: one proof's argument, inverted.
 *
 * The redesign gives Repository Intelligence a dark treatment because its argument is
 * a single recorded run and it should read as the page's one held note. It does *not*
 * darken the whole section: the three-layer chain and the evidence panel below carry
 * evidence the redesign never showed on dark, and inventing dark variants for six
 * unrelated components to satisfy a band would be a lot of surface area for no
 * argument. So the band covers the signature and the remainder stays on light ground.
 *
 * Implemented by remapping the colour tokens for the subtree rather than by writing a
 * dark rule for every descendant. `RepositoryDecisionDiff` alone is ~480 lines of CSS
 * built from these tokens; duplicating it under a `.dark` selector would double it and
 * guarantee the two copies drift. Redefining the tokens here means anything rendered
 * inside inverts correctly without knowing it is on dark, including components added
 * later.
 */
export function ProofSignature({ children }: { children: React.ReactNode }) {
  return <div className={styles.signature}>{children}</div>;
}

/** The section's opening: chapter mark on one side, thesis on the other. */
export function ProofMasthead({ children }: { children: React.ReactNode }) {
  return <div className={styles.masthead}>{children}</div>;
}

export function ProofThesis({ children }: { children: React.ReactNode }) {
  return <p className={styles.thesis}>{children}</p>;
}

/**
 * The proof layer: everything an evaluator reads once they have decided to check.
 *
 * Set on its own quiet ground and pushed to the section's full measure, so the
 * transition out of the scan layer is a change of surface rather than just more
 * paragraphs.
 */
export function ProofLayer({
  children,
  tone = 'light',
}: {
  children: React.ReactNode;
  tone?: 'light' | 'dark';
}) {
  return (
    <div className={`${styles.layer} ${tone === 'dark' ? styles.layerDark : ''}`}>
      <div className={styles.layerInner}>{children}</div>
    </div>
  );
}

/** One column of the proof layer. `basis` tunes how it competes for the row. */
export function ProofLayerColumn({
  label,
  children,
  accent = false,
  narrow = false,
}: {
  label: string;
  children: React.ReactNode;
  accent?: boolean;
  narrow?: boolean;
}) {
  return (
    <div className={`${styles.layerColumn} ${narrow ? styles.layerColumnNarrow : ''}`}>
      <span className={`${styles.layerLabel} ${accent ? styles.layerLabelAccent : ''}`}>
        {label}
      </span>
      {children}
    </div>
  );
}

export function ProofLayerBody({ children }: { children: React.ReactNode }) {
  return <p className={styles.layerBody}>{children}</p>;
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
