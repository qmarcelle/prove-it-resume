import type { ResumeProjectionId } from '@/lib/types';
import { resolveResumeById } from '@/content/resume';
import { DefaultResumeLayout } from './layouts/DefaultResumeLayout';
import { LinearResumeLayout } from './layouts/LinearResumeLayout';
import { ResumeSheet } from './parts/ResumePage';

/**
 * The two-page letter résumé, as one printable document.
 *
 * Ported from the Claude Design export's `<doc-page size="letter">` with explicit
 * pagination: two fixed page boxes rather than a single reflowing text stream. That
 * choice is load-bearing. The design places a boundary note at the foot of page one and
 * a footer at the foot of page two using `margin-top: auto`, which only means anything
 * inside a box of known height: let the browser paginate this and both float upward
 * into the middle of whatever page they land on.
 *
 * So each page is exactly `8.5in × 11in` with `overflow: hidden`, and the print rules
 * pin `@page` to the same geometry with zero margin (the insets live on the page's own
 * padding). Chromium then renders one sheet per section, which is what makes the PDF
 * identical to what this route shows on screen.
 *
 * ## Two layouts, chosen by the projection
 *
 * `projection` names a *content* projection, which durable facts appear, in what order,
 * and each projection declares which of the two compositions renders it. The switch
 * is exhaustive on purpose: adding a third layout is a type error here rather than a
 * silent fallthrough to the durable one, which would ship the wrong résumé under the
 * right filename.
 *
 * A Server Component with no interactivity: this ships no JavaScript, and the PDF build
 * gets a fully-rendered document without waiting on hydration.
 */
export function ResumeDocument({
  targetTitle,
  projection = 'default',
}: {
  targetTitle: string;
  projection?: ResumeProjectionId;
}) {
  const resume = resolveResumeById(projection);

  return (
    <ResumeSheet>
      {resume.layout === 'linear' ? (
        <LinearResumeLayout resume={resume} targetTitle={targetTitle} />
      ) : (
        <DefaultResumeLayout resume={resume} targetTitle={targetTitle} />
      )}
    </ResumeSheet>
  );
}
