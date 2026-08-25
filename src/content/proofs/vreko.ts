import type { Proof } from '@/lib/types';

/**
 * Copy carried over from the Claude Design export, corrected where a public audit
 * contradicted it.
 *
 * The rows below were unresolved because the export pointed them at `#sec-02` or at a
 * GitHub profile. They now carry exact permalinks at a pinned revision, each checked to
 * return 200 and to be the artifact the row names.
 *
 * **One claim was withdrawn.** The export described the public repository as containing
 * "the server implementation, tool contracts, and configuration". It does not. None of
 * the three public Vreko repositories contain implementation source — they hold a
 * README, a CHANGELOG, a licence, a package manifest and images, and only `dist/` is
 * shipped to npm. The CLI's own README states this. The description and the proof
 * boundary were rewritten to match, because a link that resolves to less than the row
 * promises is the failure mode the evidence rule exists to prevent.
 */

/** Pinned revisions the architecture claims were audited against on 2026-08-24. */
const MCP_SERVER = 'https://github.com/vreko-dev/mcp-server';
const MCP_SERVER_REV = 'c98e7ae18f8f1595adf39f2b09e251f84b5bda6b';
const CLI_REV = 'b096ce3bea72ea07481347de213cba58d197a32f';
export const vreko: Proof = {
  id: 'vreko',
  sectionId: 'sec-02',
  stage: '02',
  eyebrow: '02 / PROOF ONE',
  railLabel: 'Vreko',
  listing: { summary: 'MCP + agent intelligence' },
  title: 'Vreko',
  thesis: 'MCP and codebase intelligence for agentic development workflows',
  status: { label: 'SHIPPED SYSTEM', tone: 'shipped' },
  evidenceCode: 'EV-VRK',
  fields: [
    {
      label: 'PROBLEM',
      body: 'Coding agents enter complex repositories with limited durable understanding of project-specific risks, prior discoveries, and operating context.',
    },
    {
      label: 'BUILT',
      body: 'An MCP-based intelligence surface designed to expose repository and session context to compatible AI assistants.',
    },
  ],
  technologies: [
    'MCP',
    'JSON-RPC',
    'TypeScript',
    'Node',
    'Authentication',
    'Agent lifecycle',
    'Tool contracts',
    'Cloud deployment',
    'CI/CD',
  ],
  demonstrates: [
    'MCP implementation beyond a toy tool',
    'protocol and application-boundary thinking',
    'agent/tool interface design',
    'state and session concepts',
    'deployment and authentication concerns',
    'developer-experience thinking',
  ],
  summary: [
    {
      id: 'vreko-repo',
      label: 'Repository',
      detail: 'Vreko MCP Server',
      href: MCP_SERVER,
      verified: true,
      cta: 'OPEN REPOSITORY',
    },
    {
      id: 'vreko-architecture',
      label: 'Architecture',
      // The published decomposition, not the draft's guess. Authentication sits at the
      // HTTP edge; the intelligence layer is behind the publication boundary.
      detail: 'HTTP edge → MCP protocol surface → platform',
      detailIsCode: true,
      href: `${MCP_SERVER}/blob/${MCP_SERVER_REV}/README.md`,
      verified: true,
      cta: 'INSPECT ARCHITECTURE',
    },
    {
      id: 'vreko-workflow',
      label: 'Agent workflow',
      detail: 'brief → pulse → learn → end',
      detailIsCode: true,
      href: `https://github.com/vreko-dev/vreko-cli/blob/${CLI_REV}/README.md`,
      verified: true,
      cta: 'INSPECT COMMAND SURFACE',
    },
    {
      id: 'vreko-deployment',
      label: 'Deployment',
      detail: 'local + hosted execution paths',
      href: `${MCP_SERVER}/blob/${MCP_SERVER_REV}/package.json`,
      verified: true,
      cta: 'INSPECT MANIFEST',
    },
  ],
  evidence: [
    {
      id: 'vreko-ev-source',
      kind: 'source',
      title: 'Vreko MCP Server',
      description:
        'The public distribution and documentation surface: package manifest, architecture, deployment scripts and licence. It does not contain the implementation, which is built from the proprietary core and shipped only as dist/ to npm.',
      href: MCP_SERVER,
      verified: true,
    },
    {
      id: 'vreko-ev-architecture',
      kind: 'observed',
      title: 'HTTP edge → MCP protocol surface → platform',
      description:
        'The published four-layer decomposition and its responsibility table. Authentication and CORS sit at the HTTP edge; the protocol surface carries JSON-RPC and the tool registry; the platform behind them is named but not published.',
      href: `${MCP_SERVER}/blob/${MCP_SERVER_REV}/README.md`,
      verified: true,
    },
    {
      id: 'vreko-ev-lifecycle',
      kind: 'observed',
      title: 'Agent lifecycle: brief → pulse → learn → end',
      description:
        'The session tools a compatible assistant calls — vreko, vreko_pulse, vreko_learn, vreko_end — and the CLI command surface alongside them. Where that state is stored is not public.',
      href: `https://github.com/vreko-dev/vreko-cli/blob/${CLI_REV}/README.md`,
      verified: true,
    },
    {
      id: 'vreko-ev-deployed',
      kind: 'deployed',
      title: 'Local + hosted execution paths',
      description:
        'Two documented paths with distinct boundaries: an authenticated HTTPS edge deployed to Fly.io, and a local stdio process against a local daemon that requires no repository contents to leave the machine.',
      href: `${MCP_SERVER}/blob/${MCP_SERVER_REV}/package.json`,
      verified: true,
    },
  ],
  boundary:
    'The public repositories establish package identity, the protocol surface, the execution paths, and where the proprietary boundary falls — four packages resolve on the npm registry and nine that public manifests depend on do not. They do not establish the core implementation, which is not published, nor adoption, usage volume, or production scale. The CLI publishes no accuracy figure for its AI-attributed change detection and describes it as a heuristic.',
};
