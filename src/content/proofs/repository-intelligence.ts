import type { EvidenceRef, Proof } from '@/lib/types';
import { PUBLISHED_SITES } from '../published';

/**
 * The one confirmed external artifact in the supplied design: the Tally case study.
 * It appears twice in the export with the same URL, so it is treated as verified.
 */
export const TALLY_CASE_URL = `${PUBLISHED_SITES.workspaceJson}/showcase/tally`;

/**
 * The canonical workspace.json repositories. Authority is split deliberately:
 * `standard` owns the specification and depends on nothing else; `cli` is the neutral
 * producer; `integrations` holds host-side consumers. The Codex adapter still
 * publishes from the historical `workspace-json` namespace, which is why that one URL
 * points there rather than at the canonical organization.
 *
 * The published site at `workspacejson.dev` is the standard's own front door, so it
 * carries the calls to action: `/spec/` is the specification, `/schema/v1.json` the
 * machine-checkable contract, `/getting-started/` the producer path, `/governance/` the
 * stewardship model, and `/implementations/codex/` the agent adapter. The repositories
 * stay as the pinned sources: a specification is only as good as the tree it is
 * committed in, and that is what a reader checking the claim wants.
 */
const WSJ_SITE = PUBLISHED_SITES.workspaceJson;
const WSJ_STANDARD = 'https://github.com/workspacejson/standard';
const WSJ_CLI = 'https://github.com/workspacejson/cli';
const WSJ_INTEGRATIONS = 'https://github.com/workspacejson/integrations';
const WSJ_CODEX = 'https://github.com/workspace-json/codex-mcp';

/** The three layers of the argument, rendered as a vertical chain. */
export type RepositoryLayer = {
  id: string;
  kicker: string;
  name: string;
  /** Renders the name in the mono face, for file- and code-shaped names. */
  nameIsCode?: boolean;
  subtitle?: string;
  body: string[];
  tags: string[];
  link?: { label: string; ref: EvidenceRef };
  /** The final layer is accented, as in the export. */
  emphasis?: boolean;
};

export const repositoryLayers: readonly RepositoryLayer[] = [
  {
    id: 'standard',
    kicker: 'STANDARD',
    name: 'workspace.json',
    nameIsCode: true,
    body: [
      'A neutral, Apache-2.0 contract for repository-derived intelligence, committed alongside the code it describes.',
    ],
    tags: ['SPECIFICATION', 'JSON Schema', 'Governance'],
  },
  {
    id: 'agent',
    kicker: 'AGENT IMPLEMENTATION',
    name: 'workspace.json for Codex',
    nameIsCode: true,
    body: [
      "Portable repository history that changes Codex's plan before an evidenced risky edit lands.",
    ],
    tags: ['Codex', 'MCP', 'Hooks', 'Co-change / fragility'],
    link: {
      label: 'INSPECT THE CODEX ADAPTER',
      ref: {
        id: 'codex-adapter',
        kind: 'source',
        title: 'workspace.json for Codex',
        href: `${WSJ_SITE}/implementations/codex/`,
        verified: true,
        sourceHref: WSJ_CODEX,
        sourceLabel: 'workspace-json/codex-mcp',
      },
    },
  },
  {
    id: 'enterprise',
    kicker: 'ENTERPRISE INTEGRATION',
    name: 'Tally',
    subtitle: 'Change impact cockpit',
    body: [
      'Joins DataHub context with repository evidence. Resolves the coordinate mismatch between dbt paths and git-root paths, where the naive join silently returns zero, then compares paired plans to see whether the joined evidence changes what the model can do.',
      'Writeback is independently checked rather than treated as observed because an API call returned successfully.',
    ],
    tags: [
      'DataHub',
      'dbt',
      'Path resolution',
      'Paired plan comparison',
      'Writeback verification',
    ],
    link: {
      label: 'READ THE TALLY CASE',
      ref: {
        id: 'tally-case',
        kind: 'observed',
        title: 'Tally case study',
        href: TALLY_CASE_URL,
        verified: true,
      },
    },
    emphasis: true,
  },
] as const;

export const ARGUMENT_IN_ONE_LINE =
  'Identified a repository-context problem, designed a portable contract, implemented it for a coding agent, integrated it with an enterprise metadata system, then tested whether the information actually changed the plan.';

export const ACTIVE_RESEARCH_QUESTION =
  "What repository-derived information, available at decision time, can causally improve an AI agent's decision?";

export const repositoryIntelligence: Proof = {
  id: 'repository-intelligence',
  sectionId: 'repository-intelligence',
  stage: '03',
  eyebrow: '03 / PROOF TWO',
  railLabel: 'Repository Intelligence',
  listing: {
    summary: 'workspace.json → Codex → Tally',
    summaryIsCode: true,
    shortName: 'workspace.json',
    shortNameIsCode: true,
    shortStatus: 'OPEN STANDARD',
  },
  title: 'Repository Intelligence',
  thesis:
    'Making repository evidence useful to an agent at decision time: contract, agent implementation, enterprise integration.',
  status: { label: 'STANDARD · IMPLEMENTED · INTEGRATED', tone: 'implemented' },
  evidenceCode: 'EV-WSJ',
  fields: [
    {
      label: 'PROBLEM',
      body: 'Important repository-derived information is scattered across files, conventions, tools, and provider-specific mechanisms.',
    },
    {
      label: 'WORK',
      body: 'Designed and stewarded an Apache-2.0 descriptive standard for committing repository intelligence in a deterministic, tool-consumable form.',
    },
  ],
  demonstrates: [
    'standards thinking',
    'schema and contract design',
    'governance',
    'producer/consumer boundaries',
    'evidence discipline',
    'open-source stewardship',
    'implementing a specification I authored against a real coding agent',
    'integration engineering across enterprise metadata and repository evidence',
    'ability to distinguish descriptive infrastructure from prescriptive agent policy',
  ],
  summary: [
    {
      id: 'wsj-spec',
      label: 'Canonical specification',
      href: `${WSJ_SITE}/spec/`,
      verified: true,
      sourceHref: WSJ_STANDARD,
      sourceLabel: 'workspacejson/standard',
      cta: 'READ THE SPEC',
    },
    {
      id: 'wsj-schema',
      label: 'JSON Schema / types',
      href: `${WSJ_SITE}/schema/v1.json`,
      verified: true,
      sourceHref: `${WSJ_STANDARD}/tree/main/packages/spec`,
      sourceLabel: 'workspacejson/standard · packages/spec',
      cta: 'INSPECT',
    },
    {
      id: 'wsj-cli',
      label: 'CLI / producer tooling',
      href: `${WSJ_SITE}/getting-started/`,
      verified: true,
      sourceHref: WSJ_CLI,
      sourceLabel: 'workspacejson/cli',
      cta: 'INSPECT',
    },
    {
      id: 'wsj-codex',
      label: 'Codex implementation',
      detail: 'agent-side hooks and repository history',
      href: `${WSJ_SITE}/implementations/codex/`,
      verified: true,
      sourceHref: WSJ_CODEX,
      sourceLabel: 'workspace-json/codex-mcp',
      cta: 'OPEN DOCS',
    },
    {
      id: 'wsj-tally',
      label: 'Tally · DataHub integration',
      detail: 'paired plan comparison + writeback check',
      href: TALLY_CASE_URL,
      verified: true,
      cta: 'READ CASE',
    },
    {
      id: 'wsj-integrations',
      label: 'Integrations',
      // No published page covers the host-side consumer repos; /conformance/ states the
      // obligations, not the implementations. The repository stays the artifact.
      href: WSJ_INTEGRATIONS,
      verified: true,
      cta: 'INSPECT',
    },
  ],
  evidence: [
    {
      id: 'wsj-ev-spec',
      kind: 'specification',
      title: 'Canonical specification (Apache-2.0)',
      description:
        'Descriptive standard for committing repository-derived information in a deterministic, tool-consumable form.',
      href: `${WSJ_SITE}/spec/`,
      verified: true,
      sourceHref: WSJ_STANDARD,
      sourceLabel: 'workspacejson/standard',
    },
    {
      id: 'wsj-ev-schema',
      kind: 'specification',
      title: 'JSON Schema / types',
      description:
        'Machine-checkable contract separating producers of repository intelligence from its consumers.',
      href: `${WSJ_SITE}/schema/v1.json`,
      verified: true,
      sourceHref: `${WSJ_STANDARD}/tree/main/packages/spec`,
      sourceLabel: 'workspacejson/standard · packages/spec',
    },
    {
      id: 'wsj-ev-cli',
      kind: 'source',
      title: 'CLI / producer tooling',
      description:
        'Reference producer that generates and validates the committed artifact.',
      href: `${WSJ_SITE}/getting-started/`,
      verified: true,
      sourceHref: WSJ_CLI,
      sourceLabel: 'workspacejson/cli',
    },
    {
      id: 'wsj-ev-codex',
      kind: 'source',
      title: 'workspace.json for Codex',
      description:
        'Agent-side implementation: portable repository history surfaced through hooks and MCP before an evidenced risky edit lands.',
      href: `${WSJ_SITE}/implementations/codex/`,
      verified: true,
      sourceHref: WSJ_CODEX,
      sourceLabel: 'workspace-json/codex-mcp',
    },
    {
      id: 'wsj-ev-tally',
      kind: 'observed',
      title: 'Tally · DataHub + repository evidence',
      description:
        'Dataset resolved to an exact repository-relative path, joined with repository evidence, then compared as paired plans. Writeback checked independently of the API response.',
      href: TALLY_CASE_URL,
      verified: true,
    },
    {
      id: 'wsj-ev-research',
      kind: 'research',
      title: 'Decision-time information study (preregistered)',
      description:
        'Preregistered characterization of which qualifying historical relationships survive the projection at decision time, frozen before any result was computed. No model was run: it measures what the artifact carries, not whether an agent is helped by it.',
      // The preregistered study is not republished on the site; the Tally proof ledger
      // is a different artifact and must not stand in for it.
      href: `${WSJ_CLI}/tree/main/docs/evidence/meta-375`,
      verified: true,
    },
  ],
  boundary:
    'The specification establishes a repository-level contract and its governance. It does not establish adoption outside the repositories where it has been applied, and it is independent from proprietary Vreko behavior.',
  boundaryNote:
    'workspace.json is presented here as an independent open standard, not as a Vreko feature.',
};
