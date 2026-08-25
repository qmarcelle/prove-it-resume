import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResumeDocument } from '@/components/resume/ResumeDocument';
import { resumeTargetTitle } from '@/lib/resume';
import { getPrintableLens, listPrintableSlugs } from '@/lib/role-lens';

/**
 * The printable résumé under one lens.
 *
 * A lens changes two things here: the masthead's target title, and which *content
 * projection* renders. Role lenses change only the first — the durable résumé under a
 * different heading — because a generic lens has no business reordering a career.
 * An application lens may change both, and the Linear lens does: same corpus, different
 * selection and different order. See ADR 0010.
 *
 * The route walks the combined registry rather than the role registry, so registering
 * an application lens gives it a print route, a manifest entry, and a PDF with no edit
 * here or in the build script.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return listPrintableSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lens = getPrintableLens(slug);
  if (!lens) return {};

  return {
    title: { absolute: `Qwynn Marcelle — résumé · ${lens.roleTitle}` },
    robots: { index: false, follow: false },
  };
}

export default async function LensResumePrintPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lens = getPrintableLens(slug);
  if (!lens) notFound();

  return (
    <ResumeDocument
      targetTitle={resumeTargetTitle(lens)}
      projection={lens.resumeProjection}
    />
  );
}
