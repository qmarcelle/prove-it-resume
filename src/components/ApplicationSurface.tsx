import { Hero } from '@/components/hero/Hero';
import { EvidenceChain } from '@/components/hero/EvidenceChain';
import { EvidenceIndex } from '@/components/hero/EvidenceIndex';
import { ClaimLedger } from '@/components/evidence/ClaimLedger';
import { FinalCta } from '@/components/layout/FinalCta';
import { ResumeBridge } from '@/components/layout/ResumeBridge';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { GuidedProofNav } from '@/components/proof/GuidedProofNav';
import { ProofNavProvider } from '@/components/proof/ProofNavProvider';
import { ProofProgress } from '@/components/proof/ProofProgress';
import { CareerSection } from '@/components/proof/sections/CareerSection';
import { InterlockSection } from '@/components/proof/sections/InterlockSection';
import { RepositoryIntelligenceSection } from '@/components/proof/sections/RepositoryIntelligenceSection';
import { VrekoSection } from '@/components/proof/sections/VrekoSection';
import { SupportingEvidence } from '@/components/supporting/SupportingEvidence';
import { LinearInPracticeSection } from '@/components/application/LinearInPracticeSection';
import { ProductHistorySection } from '@/components/application/ProductHistorySection';
import { ProductJudgementSection } from '@/components/application/ProductJudgementSection';
import { neverAskTwice } from '@/content/supporting/never-ask-twice';
import { proofEntry, supportingEntry } from '@/lib/index-entries';
import { numberSections, requireStep, stepsById } from '@/lib/page-plan';
import { projectProofs } from '@/lib/role-lens';
import type { ApplicationLens, SectionProjection, SurfaceStep } from '@/lib/types';
import lensStyles from './LensSurface.module.css';
import styles from './ProveItResume.module.css';

/**
 * An application surface: the same durable evidence, composed for one organisation.
 *
 * A second composition rather than a flag on `ProveItResume`, and that is the one real
 * judgement call in this feature. The two pages share every component below the section
 * level: the header, the hero, the three proof sections, the career list, the résumé
 * bridge, the claim ledger, the footer, the evidence rule, and the whole token layer,
 * and differ in which sections appear, in what order, and what opens the page. Encoding
 * that difference as branches inside one component would have produced a file where
 * every second line asks which surface it is on, and the honest reading of a page like
 * that is that there are two compositions in it anyway.
 *
 * What must not fork is the evidence, and it does not: the proof sections are the same
 * modules `/` renders, `projectProofs` is the same projection, and this file introduces
 * no `Proof`, no `Claim`, and no evidence row. `role-lens.test.ts` asserts that every
 * lens (application lenses included) projects the same proof objects as the durable
 * set, so a section added here cannot smuggle in a claim.
 *
 * ## The page plan is the only sequence
 *
 * Every visible number, the reading order, each section's eyebrow, the header nav, the
 * skip link, the guided rail and the progress rail are read from `lens.pagePlan`,
 * stamped once by `numberSections`. No section states its own position, and a section
 * rendered here that the plan does not list throws rather than rendering unnumbered,
 * because a page whose map and page disagree is the failure this whole arrangement is
 * for.
 */
const PROOF_SECTIONS: Record<
  string,
  (props: { step: SurfaceStep; projection?: SectionProjection }) => React.ReactNode
> = {
  vreko: VrekoSection,
  'repository-intelligence': RepositoryIntelligenceSection,
  interlock: InterlockSection,
};

/**
 * Which lens section projection frames which proof.
 *
 * Vreko is deliberately absent. It is demoted on this surface rather than promoted, and
 * a section already reduced to one row of platform depth does not need a curiosity path
 * to make it shorter; forcing one would be interaction for its own sake.
 */
const SECTION_PROJECTIONS: Record<string, 'repositoryIntelligence' | 'interlock'> = {
  'repository-intelligence': 'repositoryIntelligence',
  interlock: 'interlock',
};

export function ApplicationSurface({ lens }: { lens: ApplicationLens }) {
  const proofs = projectProofs(lens);
  const steps = numberSections(lens.pagePlan);
  const byId = stepsById(steps);
  const step = (id: string) => requireStep(byId, id);

  /*
   * The proof sections, in the order the *plan* puts them.
   *
   * Read from the plan rather than from `proofOrder` so there is one sequence rather
   * than two that have to be kept in agreement by hand. `role-lens.test.ts` asserts the
   * two lists name the same proofs, which is what keeps the evidence projection and the
   * reader's page from diverging.
   */
  const proofSteps = steps.filter((entry) => entry.proof);

  /*
   * The in-page nav, derived from the same stamped list, numbers included. Four entries
   * is what the bar fits at this measure once each carries its sequence number; the
   * rail carries the rest.
   */
  const nav = steps
    .slice(0, 4)
    .map((entry) => ({ label: `${entry.n} ${entry.label}`, href: `#${entry.id}` }));

  const opening = steps[0];

  /*
   * The Evidence Index, in the page's own order and including the promoted entry.
   *
   * Built from the plan rather than from `proofOrder`, so the hero lists what this page
   * actually leads with. The index used to show the three durable proofs while the body
   * opened its evidence with a fourth system, so the ten-second surface advertised a
   * set the sixty-second one contradicted. Never Ask Twice is the closest system in the
   * corpus to what this reader builds; an index that structurally could not name it was
   * pointing at the wrong three.
   *
   * `supportingEntry` returns null for work carrying no listing, and `proof` steps
   * whose proof is not in the projection drop out the same way, so this cannot render a
   * row for something the page does not have.
   */
  const byProofId = new Map(proofs.map((proof) => [proof.id, proof]));
  const indexEntries = steps.flatMap((entry) => {
    if (entry.proof) {
      const proof = byProofId.get(entry.proof);
      return proof ? [{ ...proofEntry(proof), id: entry.id }] : [];
    }
    if (entry.id === 'never-ask-twice') {
      const promoted = supportingEntry(neverAskTwice, entry.id);
      return promoted ? [promoted] : [];
    }
    return [];
  });

  return (
    <ProofNavProvider steps={steps}>
      <div className={lensStyles.surface}>
        <a className={styles.skipLink} href={`#${opening.id}`}>
          Skip to the proof
        </a>

        <SiteHeader
          lens={lens}
          showAvailability={lens.showAvailability}
          availability={lens.hero.availability}
          nav={nav}
        />

        {/*
         * The chain replaces the durable page's bounded path here. Both are one-shot
         * compositions that settle and stay; they argue different things, and this
         * reader already operates the pipeline the chain draws.
         */}
        <Hero figure={<EvidenceChain />} framing={lens.hero} lens={lens}>
          <EvidenceIndex entries={indexEntries} caption="START ANYWHERE" />
        </Hero>

        <div className={styles.body}>
          <ProofProgress />

          <main className={styles.main} id="main">
            <ProductHistorySection
              copy={lens.sections.history}
              step={opening}
              nextId={steps[1].id}
            />

            <LinearInPracticeSection
              copy={lens.sections.inPractice}
              receipts={lens.receipts}
              step={step('linear-in-practice')}
            />

            {/*
             * Never Ask Twice, promoted out of the appendix.
             *
             * It is the closest of the four systems to what this reader builds, and on
             * `/` it sits after the three proofs as supporting work. Here it leads them:
             * with a number, which is the part that was missing: promoted content that
             * stays outside the sequence reads as an aside no matter where it is put.
             * The work, its question, its surface, its boundary, and its evidence row
             * are the same records; only the framing above it and its position change.
             */}
            <SupportingEvidence
              step={step('never-ask-twice')}
              framing={{
                heading: lens.sections.memory.heading,
                lead: lens.sections.memory.body,
              }}
              projection={lens.sections.memory}
            />

            {/*
             * The proof sections, each handed this surface's framing where it has one.
             *
             * `SECTION_PROJECTIONS` keys a lens projection to a proof, so a proof this
             * surface has not framed simply renders its durable composition rather
             * than needing a branch here. The sections are the same modules `/`
             * renders; what the projection changes is the opening question and the
             * order, never what the evidence says.
             */}
            {proofSteps.map((entry) => {
              const Section = PROOF_SECTIONS[entry.proof as string];
              if (!Section) return null;
              const projection = SECTION_PROJECTIONS[entry.proof as string];
              return (
                <Section
                  key={entry.id}
                  step={entry}
                  projection={projection ? lens.sections[projection] : undefined}
                />
              );
            })}

            <ProductJudgementSection lens={lens} step={step('product-judgment')} />
            <CareerSection proofs={proofs} step={step('career')} />
            <ResumeBridge lens={lens} />
            <ClaimLedger step={step('claim-ledger')} />
          </main>
        </div>

        <FinalCta lens={lens} />
        <SiteFooter lens={lens} />
        <GuidedProofNav />
      </div>
    </ProofNavProvider>
  );
}
