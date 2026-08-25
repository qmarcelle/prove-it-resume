import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResumeDocument } from '@/components/resume/ResumeDocument';
import { resumeTargetTitle } from '@/lib/resume';
import { getRoleLens, listRoleSlugs } from '@/lib/role-lens';

/**
 * The printable résumé under one role lens.
 *
 * The lens changes exactly one thing — the masthead's target title. That is the whole
 * of the design export's `targetTitle` prop, and widening it would turn a résumé into
 * something that says different things to different readers, which is the opposite of
 * what this artifact is for.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return listRoleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lens = getRoleLens(slug);
  if (!lens) return {};

  return {
    title: { absolute: `Qwynn Marcelle — résumé · ${lens.roleTitle}` },
    robots: { index: false, follow: false },
  };
}

export default async function RoleResumePrintPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lens = getRoleLens(slug);
  if (!lens) notFound();

  return <ResumeDocument targetTitle={resumeTargetTitle(lens)} />;
}
