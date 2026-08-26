import type { RepositoryDecisionDiffData } from '@/lib/interactions';

/**
 * HAC-152: the paired plan run behind the Repository Decision Diff.
 *
 * Every value below is read from a frozen artifact committed in a public repository,
 * not from the design storyboard. The storyboard's version of this frame showed two
 * evidence cards labelled `CO-CHANGE` and `FRAGILITY`; this run contains neither, and
 * one of its recorded fields says so explicitly (see `rdd-ev-partners`). That mismatch
 * is why `DecisionEvidence.kind` is an open string: the model follows the evidence.
 *
 * Source of every figure:
 *   workspacejson/datahub-agent @ 3607805f
 *   evaluation/hac-152/live-qwen-judge-run-bundle.json
 *   sha256 7498f885e981d6d780ad7abef0c93ddd5dc0bd76eea16db9fb694017cf2ecb1a
 *
 * Verified locally on 2026-08-24 with `shasum -a 256 -c SHA256SUMS` in that directory:
 * all three artifacts matched.
 */

const REPO = 'https://github.com/workspacejson/datahub-agent';
const REV = '3607805fe1a00b6c18eac0d50371edad88fd5214';
const BUNDLE = `${REPO}/blob/${REV}/evaluation/hac-152/live-qwen-judge-run-bundle.json`;

/** The revision of the repository the workspace artifact was built from. */
const CORPUS_REVISION = '59fa295c51fc23466f3a71542f8bf3d1335daa83';

export const repositoryDecision: RepositoryDecisionDiffData = {
  experiment: 'HAC-152',
  question:
    'Does repository evidence available at decision time change the plan a model produces for the same task?',

  /*
   * Quoted from the run bundle's two `run` records, which are byte-identical across
   * both conditions apart from `mode`. This is the one place the interaction is
   * allowed to say "same model": the artifact records the model name, the prompt
   * digest and the settings digest, and they match.
   */
  controls: {
    varied:
      'The context envelope. One condition received the catalog projection alone; the other received the same projection plus the corpus-matched repository evidence.',
    heldFixed: [
      'Task: add-quality-check',
      'Prompt digest: sha256:d19f4d09…4373e413, identical in both conditions',
      'Model: qwen-plus',
      'Decoding settings: sha256:e4ff4911…d9b621e0, temperature zero',
      'Subject: urn:li:dataset:(urn:li:dataPlatform:dbt,duck.dev.game_events,PROD)',
    ],
  },

  baselineLabel: 'Catalog projection only',
  informedLabel: 'Catalog projection + repository evidence',

  baselineSteps: [
    'refuse to add the dbt quality check because the repository-relative source location is unknown and cannot be guessed',
  ],

  informedSteps: [
    'Add a dbt quality check for game_events, preserving the declared lineage and recording the DataHub enrichment outcome, using repository-relative source "dbt/models/curated/game_events.sql" and pinned revision "59fa295c51fc23466f3a71542f8bf3d1335daa83"',
  ],

  /*
   * The three rows are the artifact's own `comparison.deltas`, in its order, with its
   * `kind`, `label`, `reason` and `evidenceRefs` carried across unchanged. Nothing here
   * is computed by diffing the two plans in this codebase.
   */
  diff: [
    {
      id: 'rdd-row-removed',
      change: 'removed',
      text: 'refuse unknown source location',
      attributedTo: ['rdd-ev-absent', 'rdd-ev-source'],
      reason:
        'The DataHub-only projection records that repository-relative source location is not exposed; joined evidence resolves it exactly.',
    },
    {
      id: 'rdd-row-added',
      change: 'added',
      text: 'use exact source dbt/models/curated/game_events.sql',
      attributedTo: ['rdd-ev-source'],
      reason:
        'Only the joined context contains the corpus-matched repository-relative producing file.',
    },
    {
      id: 'rdd-row-constrained',
      change: 'constrained',
      text: `constrain work to dbt/models/curated/game_events.sql at ${CORPUS_REVISION}`,
      attributedTo: ['rdd-ev-source'],
      reason:
        'The exact corpus revision and producing file constrain the joined plan to one checkable source location.',
    },
  ],

  evidence: [
    {
      id: 'rdd-ev-source',
      label: 'Exact producing source',
      kind: 'corpus-matched workspace artifact',
      observation:
        'Artifact repository, revision, and repository-relative source path matched exactly.',
      provenance: {
        source: '.agents/workspace.json for dcaribou/transfermarkt-datasets',
        revision: CORPUS_REVISION,
        producer: '@workspacejson/cli',
      },
      verification: {
        method:
          'The bundle records integrity "exact-match" over 131 file-index keys; the bytes are digest-checked against the packaged SHA256SUMS.',
        command: 'shasum -a 256 -c SHA256SUMS',
      },
      boundary:
        'This resolves where the model lives. It asserts nothing about how that file behaves or what else changes with it.',
    },
    {
      id: 'rdd-ev-absent',
      label: 'Source location absent from the catalog',
      kind: 'not-exposed-by-source',
      observation:
        'The official DataHub MCP projection exposes the dbt model path but not repository, revision, or project prefix. Exact resolution requires a corpus-matched workspace artifact.',
      provenance: {
        source: 'DataHub MCP projection, recorded in the run bundle’s unavailable list',
      },
      boundary:
        'A recorded absence in one projection. It is not a claim about what DataHub can expose through other interfaces.',
    },
    {
      /*
       * Kept deliberately. This row is the evidence category the design storyboard
       * assumed would be doing the work, and the artifact records that it was not
       * available at all. Dropping it would make the run look tidier than it was.
       */
      id: 'rdd-ev-partners',
      label: 'No co-change evidence available',
      kind: 'indeterminate',
      observation:
        'The artifact resolves the exact source but contains no behavioral co-change evidence, so no partners are asserted. Completeness: not-established. Observed count: 0.',
      provenance: {
        source: 'Run bundle unavailable list, field "partners"',
      },
      boundary:
        'Nothing in this run turns on co-change. The plan changed because the source location was resolved, not because a file relationship was observed.',
    },
  ],

  boundary:
    'One recorded run, on one dataset, with one model, against a local DataHub. It shows that this context changed this plan; it does not measure how often repository evidence changes a plan, by how much, or for which tasks. Lineage completeness is recorded as not-established in both directions, and the package claims no corpus completeness.',

  artifact: {
    id: 'rdd-artifact',
    kind: 'experiment',
    title: 'HAC-152 paired plan run bundle',
    description:
      'The frozen JudgeRunBundle: both conditions, both plans, the recorded deltas, and the provenance of every field.',
    href: BUNDLE,
    verified: true,
  },

  artifactDigest:
    'sha256 7498f885e981d6d780ad7abef0c93ddd5dc0bd76eea16db9fb694017cf2ecb1a',

  verification: {
    method:
      'Re-check the frozen bytes from the evaluation directory, then re-run the paired capture against a local DataHub quickstart.',
    command: 'shasum -a 256 -c SHA256SUMS',
  },
};

/** The runner that produced the pair, for readers who want the method rather than the result. */
export const REPOSITORY_DECISION_RUNNER = {
  id: 'rdd-runner',
  kind: 'source' as const,
  title: 'Paired plan runner',
  description:
    'Invokes the model twice with an identical task prompt and settings, varying only the context envelope, and refuses to record a pair whose conditions were not actually distinct.',
  href: `${REPO}/blob/${REV}/src/integration/paired-plan-runner.ts`,
  verified: true,
};

/** The evidence package README, which states the run's own limitations. */
export const REPOSITORY_DECISION_PACKAGE = {
  id: 'rdd-package',
  kind: 'experiment' as const,
  title: 'HAC-152 live evidence package',
  description:
    'The capture, its reproduction script, and the limitations the authors record against it.',
  href: `${REPO}/blob/${REV}/evaluation/hac-152/README.md`,
  verified: true,
};
