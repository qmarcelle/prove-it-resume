import type { SupportingWork } from '@/lib/types';

export const neverAskTwice: SupportingWork = {
  id: 'never-ask-twice',
  title: 'Never Ask Twice',
  question: 'Can persistent agent memory reduce unnecessary re-asking?',
  /*
   * "Deterministic", not "live", and the correction is the point rather than a wording
   * preference.
   *
   * This line used to read "evaluated with a live re-ask-rate ablation" directly above a
   * `boundary` stating that the ablation runs against fixed synthetic fixtures and a
   * stubbed model client so that scoring is deterministic. The record contradicted
   * itself, and it did so in the direction that flatters: the summary is what a reader
   * skims and the boundary is what they read afterwards, so the stronger claim was the
   * one doing the work.
   *
   * The product can be live while its evaluation is deterministic. Those are two facts
   * and this line now states only the second, which is the one it is about.
   *
   * "Customer-support", not "enterprise support", for the same reason one level down.
   * The agent's subject is customer support and that is checkable; "enterprise" reads as
   * a claim about where it is deployed, and no enterprise deployment is established
   * anywhere in this corpus. The word was doing positioning work the evidence does not
   * pay for.
   */
  summary:
    'A customer-support MemoryAgent that carries customer context across sessions, evaluated with a deterministic re-ask-rate ablation.',
  tags: ['AGENT MEMORY', 'RETRIEVAL', 'EVALUATION', 'ABLATION'],
  surface: 'forgetting policy · MCP · pgvector / Postgres · TypeScript · cloud execution',
  boundary:
    'The ablation runs against fixed synthetic fixtures and a stubbed model client so that scoring is deterministic. It is measured within that setup and is not a general claim about memory in other products, or about behaviour under real traffic.',
  /*
   * How this names itself in the Evidence Index of a surface that promotes it.
   *
   * Both lines are compressions of the record above rather than additions to it: the
   * summary restates `question`, and `MEASURED BY ABLATION` is the same statement the
   * summary, the tags and the claim ledger already make. The tone is `controlled` for
   * the reason the boundary gives: fixed fixtures, a stubbed client, deterministic
   * scoring, which is the same category Interlock is in, not a stronger one.
   */
  listing: {
    summary: 'Agent memory, measured against re-asking',
    status: { label: 'MEASURED BY ABLATION', tone: 'controlled' },
  },
  /*
   * Three artifacts, three roles, and the separation is the point.
   *
   * The product is publicly reachable again, which makes it tempting to lead with:
   * a running agent a reader can talk to beats a markdown file every time. It is also
   * the wrong citation for every measured claim this record makes. The ablation runs
   * against fixed synthetic fixtures and a stubbed model client; the live agent runs
   * against neither. Pointing `evaluation` at the chat would have replaced the proof
   * with a demo while leaving the summary's "deterministic re-ask-rate ablation" in
   * place above it, which is the same self-contradiction the summary was corrected for.
   *
   * So the deployment is carried in its own slot, labelled on the page as a live
   * product, and it is never what an experiment claim resolves to.
   */
  evidence: {
    // In the export this pointed at the general GitHub profile, which is not the
    // ablation. It points at the evaluation document, which states the three properties
    // the harness checks and the exact command that reproduces them.
    evaluation: {
      id: 'nat-proof',
      kind: 'experiment',
      title: 'Never Ask Twice ablation',
      href: 'https://github.com/Marcelle-Labs/never-ask-twice/blob/main/docs/evaluation.md',
      verified: true,
    },
    // Verified reachable signed-out. `www.` has no DNS record, so the apex is the only
    // address that resolves and the only one this may name.
    deployment: {
      id: 'nat-live',
      kind: 'deployed',
      title: 'the live support agent',
      href: 'https://neverasktwice.dev/chat',
      verified: true,
    },
    inspector: {
      id: 'nat-facts',
      kind: 'deployed',
      title: 'the facts the running agent has recalled',
      href: 'https://neverasktwice.dev/facts',
      verified: true,
    },
  },
};
