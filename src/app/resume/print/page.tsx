import type { Metadata } from 'next';
import { ResumeDocument } from '@/components/resume/ResumeDocument';
import { defaultRole } from '@/content/roles';
import { resumeTargetTitle } from '@/lib/resume';

/**
 * The printable résumé, neutral lens.
 *
 * This route is the *source* of the generated PDF, not a second copy of it: the build
 * renders this page in Chromium and prints it. Keeping one renderer for both means the
 * PDF cannot drift from what the site says.
 *
 * `noindex` because it is a rendering surface: the artifact a reader should find is
 * the PDF, and the page it came from would be a confusing duplicate in search results.
 */
export const metadata: Metadata = {
  title: { absolute: 'Qwynn Marcelle · résumé' },
  description: 'Two-page résumé, printable.',
  robots: { index: false, follow: false },
};

export default function ResumePrintPage() {
  return (
    <ResumeDocument
      targetTitle={resumeTargetTitle(defaultRole)}
      projection={defaultRole.resumeProjection}
    />
  );
}
