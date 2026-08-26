import type { ResolvedResume } from '@/content/resume';
import { RESUME_EXPERIENCE_BOUNDARY } from '@/content/resume/facts';
import { ResumePage } from '../parts/ResumePage';
import { ResumeMasthead, ResumeRunningHead } from '../parts/ResumeMasthead';
import {
  ResumeBoundary,
  ResumeCompactEntry,
  ResumeSection,
} from '../parts/ResumeSection';
import { ResumeSystemsSection } from '../parts/ResumeSystemsSection';
import { ResumeExperienceSection } from '../parts/ResumeExperienceSection';
import { ResumeAgentPlatformSection } from '../parts/ResumeAgentPlatformSection';
import { ResumeFoundationSection } from '../parts/ResumeFoundationSection';
import { ResumeFooter } from '../parts/ResumeFooter';
import styles from '../ResumeDocument.module.css';

/**
 * The Linear composition: the same primitives, arranged for a different question.
 *
 * Page one is the person: what they have built for customers and who they led doing
 * it. Page two is the machinery: the AI products, the agent-platform receipts, and
 * the capabilities grouped so a reader can find the one they came for.
 *
 * That split is the whole argument of this variant. The durable résumé opens on
 * independent systems because it is addressed to nobody in particular and the systems
 * are the differentiator; this one opens on production product engineering because the
 * reader already builds agent infrastructure and needs to know whether the person
 * shipping it has carried a customer-facing product before.
 *
 * Each page still grows exactly one block, and each page still ends on a stated limit.
 */
export function LinearResumeLayout({
  resume,
  targetTitle,
}: {
  resume: ResolvedResume;
  targetTitle: string;
}) {
  const { identity, profile, systems, experience, agentPlatform, foundation, footer } =
    resume;

  return (
    <>
      <ResumePage n={1}>
        <ResumeMasthead
          name={identity.name}
          location={identity.location}
          meta={`${identity.revision} · PAGE 01 / 02`}
          targetTitle={targetTitle}
          domains={resume.domains}
          links={identity.links}
        />

        <ResumeSection labelLines={[profile.label]} density="narrow">
          <h2 className={styles.profileHeading}>{profile.heading}</h2>
          <p className={styles.profileBody}>{profile.body}</p>
        </ResumeSection>

        <ResumeSection
          labelLines={experience.labelLines}
          note={experience.note}
          density="tight"
          grow
        >
          <ResumeExperienceSection
            employer={experience.employer}
            roles={experience.roles}
          />
          <ResumeBoundary label="BOUNDARY" anchored>
            {RESUME_EXPERIENCE_BOUNDARY}
          </ResumeBoundary>
        </ResumeSection>
      </ResumePage>

      <ResumePage n={2}>
        <ResumeRunningHead
          name={identity.name}
          meta={`${identity.revision} · PAGE 02 / 02`}
        />

        <ResumeSection labelLines={systems.labelLines} note={systems.note} page2>
          <ResumeSystemsSection systems={systems.entries} showStack={systems.showStack} />

          {systems.compact ? (
            <ResumeCompactEntry
              label={systems.compact.label}
              name={systems.compact.system.name}
              nameIsCode={systems.compact.system.nameIsCode}
            >
              {/*
               * Summary only, no tool chain: this line has to fit on one, and block 05
               * already groups the same technologies by capability. The full stop is
               * the component's, not the fact's: `summary` is a noun phrase, and the
               * sentence it lands in is a rendering decision.
               */}
              {systems.compact.system.summary}.
            </ResumeCompactEntry>
          ) : null}

          <ResumeBoundary label={systems.boundaryLabel}>
            {systems.boundary}
          </ResumeBoundary>
        </ResumeSection>

        {agentPlatform ? (
          <ResumeSection
            labelLines={agentPlatform.labelLines}
            note={agentPlatform.note}
            density="tight"
            page2
          >
            <ResumeAgentPlatformSection receipts={agentPlatform.receipts} />
            <ResumeBoundary label={agentPlatform.boundaryLabel}>
              {agentPlatform.boundary}
            </ResumeBoundary>
          </ResumeSection>
        ) : null}

        <ResumeSection labelLines={foundation.labelLines} density="narrow" page2 grow>
          <ResumeFoundationSection
            stack={foundation.stack}
            education={foundation.education}
            educationLabel={foundation.educationLabel}
            certifications={foundation.certifications}
            nonprofit={foundation.nonprofit}
          />
          <ResumeFooter
            lead={footer.lead}
            link={footer.link}
            trailing={footer.trailing}
          />
        </ResumeSection>
      </ResumePage>
    </>
  );
}
