import { ClaimBoundary } from '@/components/evidence/ClaimBoundary';
import { SectionHead, sectionFrameClass } from '@/components/section/SectionFrame';
import type { ApplicationLens, LinearReceipt, SurfaceStep } from '@/lib/types';
import { ReceiptTabs } from './ReceiptTabs';
import styles from './ApplicationSection.module.css';

/**
 * Curated receipts from a private workspace, rendered as what they are.
 *
 * This is the section where an application surface is most tempted to cheat: the
 * material is genuinely the most relevant thing on the page and it is also the only
 * material with no public artifact behind it. The temptation is to give each row a
 * confident link (to the workspace, to a profile, to anything) and let the affordance
 * imply verification the row does not have.
 *
 * It does not. Each row carries an evidence mark in the place a call to action would
 * sit, and the mark says how far that row can be checked rather than asserting one
 * answer for all of them. All three are currently `private-verified`: the claims were
 * checked against the underlying issues, the issues are not public, and so there is
 * nothing to link. A reader who wants something they can open is told, here, to look
 * below.
 *
 * The three states replaced a single unverified mark, and the reason is worth keeping.
 * Treating "nobody checked this" and "the author checked this against a source you
 * cannot open" as the same fact punished the honest case, and covered a finished
 * application surface in `[VERIFY BEFORE PUBLISHING]`. What the split must never do is
 * let the middle state borrow the authority of a public artifact, which is why it
 * carries no destination and names itself as an attestation.
 *
 * The data path matters as much as the rendering. `receipts` is a fixed array in
 * `content/linear/receipts.ts`: no fetch, no credential, and no private workspace URL
 * anywhere in the bundle. `linear.test.ts` asserts that rather than trusting it.
 */
export function LinearInPracticeSection({
  copy,
  receipts,
  step,
}: {
  copy: ApplicationLens['sections']['inPractice'];
  receipts: readonly LinearReceipt[];
  step: SurfaceStep;
}) {
  return (
    <section
      className={sectionFrameClass(step)}
      id={step.id}
      aria-labelledby="linear-in-practice-title"
    >
      <SectionHead
        step={step}
        title={copy.heading}
        titleId="linear-in-practice-title"
        lead={copy.body}
      />

      <div className={styles.inner}>
        <ReceiptTabs receipts={receipts} />

        <ClaimBoundary variant="note">{copy.boundary}</ClaimBoundary>
      </div>
    </section>
  );
}
