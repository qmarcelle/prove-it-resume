import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProveItResume } from '@/components/ProveItResume';
import { surfaceMetadata } from '@/lib/metadata';
import { getRoleLens, listRoleSlugs } from '@/lib/role-lens';

/**
 * A role lens: the same durable evidence, projected for one engineering problem.
 *
 * Statically generated from the known slugs, and `dynamicParams: false` so an unknown
 * slug 404s rather than rendering some default projection the reader would reasonably
 * mistake for the one they asked for.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return listRoleSlugs().map((slug) => ({ slug }));
}

// `params` is a Promise in Next 16: request APIs are async across the board.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lens = getRoleLens(slug);

  if (!lens) return {};

  return {
    ...surfaceMetadata(lens, `/role/${slug}`),
    // A lens is a projection of the durable page, not a separate work. Pointing the
    // canonical at `/` keeps role routes out of the index as duplicates.
    alternates: { canonical: '/' },
    robots: { index: false, follow: true },
  };
}

export default async function RolePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lens = getRoleLens(slug);

  if (!lens) notFound();

  return <ProveItResume lens={lens} />;
}
