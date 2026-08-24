import { Hero } from '@/components/hero/Hero';
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
import { ProblemSection } from '@/components/proof/sections/ProblemSection';
import { RepositoryIntelligenceSection } from '@/components/proof/sections/RepositoryIntelligenceSection';
import { VrekoSection } from '@/components/proof/sections/VrekoSection';
import { RoleLensSection } from '@/components/role/RoleLens';
import { SupportingEvidence } from '@/components/supporting/SupportingEvidence';
import { projectProofs } from '@/lib/role-lens';
import type { RoleLens } from '@/lib/types';
import styles from './ProveItResume.module.css';

/**
 * The whole experience, composed once and shared by `/` and `/role/[slug]`.
 *
 * Two routes, one composition, one lens argument. That is what makes "role lenses are
 * projections, not forks" true in the code rather than only in the documentation: there
 * is no second page to drift out of sync, because there is no second page.
 *
 * Everything here is a Server Component except `ProofNavProvider` and the four
 * interactive leaves inside it. The provider renders `children` untouched, so passing
 * server-rendered sections through it does not drag them across the client boundary —
 * the sections, evidence rows, and copy all render on the server and ship no JavaScript.
 *
 * Proof sections are mapped by id rather than listed literally, so a lens that reorders
 * `proofOrder` reorders the page too.
 */
const PROOF_SECTIONS: Record<string, () => React.ReactNode> = {
  vreko: VrekoSection,
  'repository-intelligence': RepositoryIntelligenceSection,
  interlock: InterlockSection,
};

export function ProveItResume({ lens }: { lens: RoleLens }) {
  const proofs = projectProofs(lens);

  return (
    <ProofNavProvider>
      <a className={styles.skipLink} href="#sec-01">
        Skip to the proof
      </a>

      <SiteHeader showAvailability={lens.showAvailability} />

      <Hero>
        <EvidenceIndex proofs={proofs} />
      </Hero>

      <div className={styles.body}>
        <ProofProgress />

        <main className={styles.main} id="main">
          <ProblemSection />

          {proofs.map((proof) => {
            const Section = PROOF_SECTIONS[proof.id];
            return Section ? <Section key={proof.id} /> : null;
          })}

          <RoleLensSection lens={lens} />
          <CareerSection proofs={proofs} />
          <SupportingEvidence />
          <ResumeBridge />
          <ClaimLedger />
        </main>
      </div>

      <FinalCta />
      <SiteFooter />
      <GuidedProofNav />
    </ProofNavProvider>
  );
}
