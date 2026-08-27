import { ClaimBoundary } from '@/components/evidence/ClaimBoundary';
import { ProgressiveDisclosure } from '@/components/interactions/ProgressiveDisclosure';
import { SectionHead, sectionFrameClass } from '@/components/section/SectionFrame';
import { DISCLOSURE_KEYS, requirePath } from '@/lib/disclosure';
import type { ApplicationLens, LinearReceipt, SurfaceStep } from '@/lib/types';
import { ReceiptTabs } from './ReceiptTabs';
import styles from './ApplicationSection.module.css';

/** The receipt the first curiosity path is built around. */
const NATIVE_DELEGATION = 'META-268';

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
 * ## Why the receipts are no longer the entrance
 *
 * They used to render immediately under the heading, which asked a reader to parse
 * three private-workspace architecture decisions before deciding whether they cared
 * about any of them. The orientation layer now states the operating question, and the
 * receipts are what a reader gets for asking. Only the *order* changed: every receipt,
 * every evidence mark and every boundary in `receipts.ts` still renders, and the
 * compact signal above says how many there are and how far they can be checked so the
 * reader knows the depth exists before they commit to it.
 *
 * The first path leads with META-268 alone because it is the one that failed, and a
 * section arguing that failures should be visible should not bury its own.
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
  const path = (id: string) => requirePath(copy.paths, id);
  const delegation = receipts.find((receipt) => receipt.identifier === NATIVE_DELEGATION);

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
        {copy.secondBeat ? <p className={styles.body}>{copy.secondBeat}</p> : null}
        {copy.signal ? <p className={styles.signal}>{copy.signal}</p> : null}

        <ProgressiveDisclosure
          label="Questions this section can answer"
          queryKey={DISCLOSURE_KEYS['linear-in-practice']}
          paths={[
            {
              id: path('native-delegation').id,
              invitation: path('native-delegation').invitation,
              label: path('native-delegation').label,
              content: (
                <div className={styles.deepLayer}>
                  <div className={styles.deepProse}>
                    {path('native-delegation').paragraphs?.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  {/*
                   * The status and the boundary are read from the receipt rather than
                   * restated beside it. The prose above is a projection and may be
                   * rewritten for a different reader; how far this claim can be checked
                   * is the receipt's to say, and there must be exactly one answer.
                   */}
                  {delegation ? (
                    <>
                      <p className={styles.signal}>
                        {delegation.identifier} · {delegation.status}
                      </p>
                      <ClaimBoundary variant="note">{delegation.boundary}</ClaimBoundary>
                    </>
                  ) : null}
                </div>
              ),
            },
            {
              id: path('operating-decisions').id,
              invitation: path('operating-decisions').invitation,
              label: path('operating-decisions').label,
              content: (
                <div className={styles.deepLayer}>
                  <ReceiptTabs receipts={receipts} />
                  <ClaimBoundary variant="note">{copy.boundary}</ClaimBoundary>
                </div>
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}
