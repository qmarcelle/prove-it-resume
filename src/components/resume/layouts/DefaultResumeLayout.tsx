import type { ResolvedResume } from '@/content/resume';
import { ResumePage } from '../parts/ResumePage';
import { ResumeMasthead, ResumeRunningHead } from '../parts/ResumeMasthead';
import {
  ResumeBoundary,
  ResumeCompactEntry,
  ResumeSection,
} from '../parts/ResumeSection';
import { ResumeSystemsSection } from '../parts/ResumeSystemsSection';
import { ResumeExperienceSection } from '../parts/ResumeExperienceSection';
import { ResumeFoundationSection } from '../parts/ResumeFoundationSection';
import { ResumeFooter } from '../parts/ResumeFooter';
import styles from '../ResumeDocument.module.css';

/**
 * The durable two-page composition, written out.
 *
 * Explicit rather than generated from a block list. There are exactly two layouts in
 * this application and there is no third coming; a generic renderer would trade this
 * file — which anyone can read top to bottom and check against the printed sheet — for
 * an interpreter plus a schema, and buy nothing with it.
 *
 * The order is load-bearing and not a style choice: profile, systems, boundary on page
 * one; experience and foundation on page two, footer on the bottom rule. Exactly one
 * block per page grows, and it is the one whose last child is anchored.
 */
export function DefaultResumeLayout({
  resume,
  targetTitle,
}: {
  resume: ResolvedResume;
  targetTitle: string;
}) {
  const { identity, profile, systems, experience, foundation, footer } = resume;

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

        <ResumeSection labelLines={systems.labelLines} note={systems.note} grow>
          <ResumeSystemsSection systems={systems.entries} />

          {systems.compact ? (
            <ResumeCompactEntry
              label={systems.compact.label}
              name={systems.compact.system.name}
              nameIsCode={systems.compact.system.nameIsCode}
            >
              {systems.compact.system.compact}
            </ResumeCompactEntry>
          ) : null}

          <ResumeBoundary label={systems.boundaryLabel} anchored>
            {systems.boundary}
          </ResumeBoundary>
        </ResumeSection>
      </ResumePage>

      <ResumePage n={2}>
        <ResumeRunningHead
          name={identity.name}
          meta={`${identity.revision} · PAGE 02 / 02`}
        />

        <ResumeSection
          labelLines={experience.labelLines}
          note={experience.note}
          density="tight"
          page2
        >
          <ResumeExperienceSection
            employer={experience.employer}
            roles={experience.roles}
          />
        </ResumeSection>

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
