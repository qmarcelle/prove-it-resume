import type { Proof } from '@/lib/types';
import { interlock } from './interlock';
import { repositoryIntelligence } from './repository-intelligence';
import { vreko } from './vreko';

/** Durable proof, in narrative order. Role lenses reorder this; they never edit it. */
export const PROOFS: readonly Proof[] = [
  vreko,
  repositoryIntelligence,
  interlock,
] as const;

const BY_ID = new Map(PROOFS.map((proof) => [proof.id, proof]));

export function getProof(id: string): Proof | undefined {
  return BY_ID.get(id);
}

export { interlock, repositoryIntelligence, vreko };
