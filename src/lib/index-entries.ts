import type { IndexEntry, Proof, SupportingWork } from './types';

/**
 * Flattening durable records into Evidence Index rows.
 *
 * One function rather than two inline `.map()`s, because the index is the ten-second
 * surface and the two compositions must not be free to describe the same system
 * differently there. Everything a row shows (its name, its one line, its status, the
 * anchor it points at) is read off the record. Nothing is written here.
 *
 * `sectionId` is the anchor, not the proof's `id`. The two differ deliberately: `id`
 * identifies the proof in the content model and `sectionId` identifies the place it is
 * rendered, and on a surface that reorders its sections only the second is an address.
 */
export function proofEntry(proof: Proof): IndexEntry {
  return {
    id: proof.sectionId,
    title: proof.title,
    summary: proof.listing.summary,
    summaryIsCode: proof.listing.summaryIsCode,
    status: proof.status,
  };
}

/**
 * A promoted supporting entry, at the section id the page plan gave it.
 *
 * `sectionId` is passed in rather than read off the work, because supporting work has
 * no fixed section of its own: on `/` it is the unnumbered appendix and on `/linear` it
 * is a planned section. The plan owns where it sits; the record owns what it says.
 *
 * Returns `null` when the work carries no listing, so a surface that promotes something
 * un-listable renders an index without it rather than a row with invented copy.
 */
export function supportingEntry(
  work: SupportingWork,
  sectionId: string,
): IndexEntry | null {
  if (!work.listing) return null;
  return {
    id: sectionId,
    title: work.title,
    summary: work.listing.summary,
    summaryIsCode: work.listing.summaryIsCode,
    status: work.listing.status,
  };
}
