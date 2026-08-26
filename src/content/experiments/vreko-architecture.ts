import type { VrekoArchitectureData } from '@/lib/interactions';

/**
 * The public Vreko architecture.
 *
 * Audited on 2026-08-24 against the current public repositories and the public npm
 * registry. Three findings shaped what this file says, and none of them match what the
 * design storyboard assumed:
 *
 * 1. **None of the three public repositories contain implementation source.** They hold
 *    a README, a CHANGELOG, a LICENCE, a package manifest and images. `vreko-cli`'s own
 *    README states this outright: "The CLI is built from the proprietary Vreko core, so
 *    the implementation is not published here." So the public architecture is
 *    established by *published package boundaries and published documentation*, and
 *    this interaction says exactly that rather than implying readable internals.
 *
 * 2. **The public/private split is mechanically checkable.** Four packages resolve on
 *    the npm registry; nine that public manifests depend on return 404. That is a
 *    boundary a reader can re-derive in one command, which makes it better evidence
 *    than any diagram.
 *
 * 3. **The storyboard's labels are not all supported.** It proposed `Transport`,
 *    `MCP protocol`, `Intelligence layer`, `Session store`, `Repository index`,
 *    `Evidence resolver` and `Auth context`. The published architecture uses a
 *    different decomposition, and authentication sits at the HTTP edge rather than
 *    inside the intelligence layer. The public decomposition is used.
 *
 * Where the public material contradicts itself, the contradiction is recorded in
 * `discrepancies` rather than resolved by guessing.
 */

const MCP_SERVER_REPO = 'https://github.com/vreko-dev/mcp-server';
const MCP_SERVER_REV = 'c98e7ae18f8f1595adf39f2b09e251f84b5bda6b';
const CLI_REPO = 'https://github.com/vreko-dev/vreko-cli';
const CLI_REV = 'b096ce3bea72ea07481347de213cba58d197a32f';

export const vrekoArchitecture: VrekoArchitectureData = {
  question:
    'What can an evaluator actually inspect of this system, and where does the public boundary fall?',

  external: {
    upstream: {
      id: 'assistant',
      name: 'AI coding assistant',
      identifier: 'MCP client',
      summary:
        'Claude, Cursor, Windsurf, or any MCP-compatible client. Outside this system and owned by someone else.',
      publication: 'external',
      components: [],
      provenance: {
        source: 'vreko-dev/mcp-server README, "What is Vreko MCP Server?"',
        revision: MCP_SERVER_REV,
      },
    },
    downstream: {
      id: 'workspace',
      name: 'Your workspace',
      identifier: 'x-workspace-path',
      summary:
        'The repository the assistant is working in. Supplied per request as a header; never bundled into the server.',
      publication: 'external',
      components: [],
      provenance: {
        source: 'vreko-dev/mcp-server README, MCP call example',
        revision: MCP_SERVER_REV,
      },
    },
  },

  system: {
    id: 'vreko',
    name: 'Vreko',
    identifier: 'vreko-mcp-server@3.1.1 · @vreko/cli@3.3.5',
    summary:
      'Holds repository and session intelligence and exposes it to a compatible assistant over MCP, through either a hosted HTTP edge or a local process.',
    publication: 'public',
    components: [],
    provenance: {
      source: 'Published package manifests and the public READMEs',
      revision: MCP_SERVER_REV,
    },
  },

  containers: [
    {
      id: 'hosted-edge',
      name: 'Hosted edge',
      identifier: 'vreko-mcp-server@3.1.1',
      summary:
        'An Express HTTP server so a client can connect over HTTPS instead of installing anything locally. Deployed as a Fly.io app.',
      publication: 'public',
      provenance: {
        source: 'vreko-dev/mcp-server README (Architecture) and package.json',
        revision: MCP_SERVER_REV,
        producer: 'vreko-mcp-server',
      },
      components: [
        {
          id: 'http-server',
          name: 'HTTP server',
          responsibility:
            'Terminates HTTPS and formats requests and responses. Exposes GET /health and POST /mcp.',
          publication: 'public',
          identifier: 'Express',
        },
        {
          id: 'api-key-auth',
          name: 'API key authentication',
          responsibility:
            'Validates the x-api-key header. The README names authentication, CORS and path-traversal protection as this layer’s concerns.',
          publication: 'public',
          identifier: 'x-api-key',
        },
        {
          id: 'request-validation',
          name: 'Request validation and resilience',
          responsibility:
            'Schema validation, a circuit breaker, and an LLM input guard, declared as direct dependencies of the published package.',
          publication: 'public',
          identifier: 'zod · opossum · llm-guard',
        },
      ],
    },
    {
      id: 'local-edge',
      name: 'Local edge',
      identifier: '@vreko/cli@3.3.5',
      summary:
        'The other documented execution path. The CLI bundles the MCP server and runs it over stdio against a local daemon, with no requirement to send repository contents anywhere.',
      publication: 'public',
      provenance: {
        source: 'vreko-dev/vreko-cli README (MCP Integration, Design properties)',
        revision: CLI_REV,
        producer: '@vreko/cli',
      },
      components: [
        {
          id: 'cli-mcp',
          name: 'Bundled MCP server',
          responsibility:
            'Started as `vreko mcp --stdio --workspace <path>` from the assistant’s own config.',
          publication: 'public',
          identifier: 'vr mcp',
        },
        {
          id: 'vrekod',
          name: 'vrekod daemon',
          responsibility:
            'Local coordination service. Analysis runs against it, which is what "local-first" means here.',
          publication: 'declared-not-published',
          identifier: 'vr start / vr stop',
        },
        {
          id: 'local-client',
          name: 'Local service client',
          responsibility:
            'Published TypeScript client for the daemon over IPC: Unix sockets, or named pipes on Windows. Its type surface is the one part of the interior that is genuinely readable: seventeen method groups including snapshot, session, intelligence, learning, protection and violation.',
          publication: 'public',
          identifier: '@vreko/local-service-client@1.0.1',
        },
      ],
    },
    {
      id: 'protocol-surface',
      name: 'MCP protocol surface',
      identifier: '@vreko/mcp',
      summary:
        'The MCP protocol handler, tool registry and session context. Both edges converge here.',
      publication: 'declared-not-published',
      provenance: {
        source: 'vreko-dev/mcp-server README (Architecture, Component Responsibilities)',
        revision: MCP_SERVER_REV,
      },
      components: [
        {
          id: 'protocol-handler',
          name: 'Protocol handler',
          responsibility:
            'Implements the Model Context Protocol over JSON-RPC, including the standard initialize handshake.',
          publication: 'declared-not-published',
          identifier: 'JSON-RPC',
        },
        {
          id: 'tool-registry',
          name: 'Tool registry',
          responsibility:
            'Registers the session lifecycle tools: vreko, vreko_pulse, vreko_learn, vreko_end.',
          publication: 'declared-not-published',
        },
        {
          id: 'session-context',
          name: 'Session context',
          responsibility:
            'Carries the per-request workspace and session identity inward. The public material names it but does not describe its storage.',
          publication: 'declared-not-published',
        },
      ],
    },
    {
      id: 'platform',
      name: 'Vreko platform',
      identifier: '@vreko/intelligence · @vreko/auth · @vreko/claims-ledger',
      summary:
        'The proprietary core. Named by the public architecture diagram and depended on by published manifests, but no implementation is published and these packages do not resolve on the registry.',
      publication: 'declared-not-published',
      provenance: {
        source:
          'vreko-dev/mcp-server README (Architecture) and the dependency list of @vreko/cli on npm',
        revision: MCP_SERVER_REV,
      },
      components: [
        {
          id: 'pattern-memory',
          name: 'Pattern memory engine',
          responsibility:
            'Learns the codebase’s specific failure modes across sessions. Named in the public diagram; not published.',
          publication: 'declared-not-published',
        },
        {
          id: 'snapshot-engine',
          name: 'Snapshot engine',
          responsibility:
            'Session snapshots and restore. Named in the public diagram; not published.',
          publication: 'declared-not-published',
        },
        {
          id: 'intelligence-layer',
          name: 'Intelligence layer',
          responsibility:
            'Risk scoring and pre-task briefing. Named in the public diagram; not published.',
          publication: 'declared-not-published',
        },
      ],
    },
  ],

  trace: [
    {
      id: 'hop-request',
      label: 'Assistant issues a tool call',
      atContainerId: null,
      boundary: 'Outside the system',
      carries:
        'A JSON-RPC request for one of the session lifecycle tools, plus the workspace path.',
    },
    {
      id: 'hop-edge',
      label: 'Crosses into the hosted edge',
      atContainerId: 'hosted-edge',
      boundary: 'HTTPS · authentication',
      carries:
        'POST /mcp with an x-api-key header and an x-workspace-path header. The key is validated here.',
      withheld: 'A request without a valid key does not reach the protocol surface.',
    },
    {
      id: 'hop-protocol',
      label: 'Crosses into the protocol surface',
      atContainerId: 'protocol-surface',
      boundary: 'Process boundary · stdio',
      carries: 'The JSON-RPC call, dispatched against the registered tool contracts.',
      withheld:
        'The public material names this hop as stdio, while the published package description calls the edge a reverse proxy to an API server. See the recorded discrepancy.',
    },
    {
      id: 'hop-platform',
      label: 'Crosses into the proprietary core',
      atContainerId: 'platform',
      boundary: 'Publication boundary',
      carries:
        'The tool call, resolved against pattern memory, snapshots and session intelligence.',
      withheld:
        'Everything about how. No implementation of this layer is published, and its packages return 404 on the registry.',
    },
    {
      id: 'hop-workspace',
      label: 'Reads the workspace',
      atContainerId: 'workspace',
      boundary: 'Back outside the system',
      carries:
        'The repository at the supplied path. The CLI writes .agents/workspace.json and AGENTS.md there for agent consumption.',
    },
  ],

  publicPackages: [
    {
      name: 'vreko-mcp-server',
      version: '3.1.1',
      registry: 'npm',
      href: 'https://www.npmjs.com/package/vreko-mcp-server',
    },
    {
      name: '@vreko/cli',
      version: '3.3.5',
      registry: 'npm',
      href: 'https://www.npmjs.com/package/@vreko/cli',
    },
    {
      name: '@vreko/contracts',
      version: '1.1.1',
      registry: 'npm',
      href: 'https://www.npmjs.com/package/@vreko/contracts',
    },
    {
      name: '@vreko/local-service-client',
      version: '1.0.1',
      registry: 'npm',
      href: 'https://www.npmjs.com/package/@vreko/local-service-client',
    },
  ],

  privatePackages: [
    '@vreko/mcp',
    '@vreko/mcp-client',
    '@vreko/mcp-config',
    '@vreko/intelligence',
    '@vreko/auth',
    '@vreko/claims-ledger',
    '@vreko/local-service',
    '@vreko/sentry-privacy',
    '@vreko/platform',
  ],

  boundaryVerification: {
    method:
      'Every package named above is a declared dependency of a published manifest. Four resolve; nine do not. Re-derive the split directly from the registry.',
    command: 'npm view @vreko/intelligence version   # E404; declared, not published',
  },

  discrepancies: [
    {
      id: 'disc-version',
      summary: 'The CLI’s public repository is behind its published package.',
      detail:
        'vreko-dev/vreko-cli carries version 3.1.7 in package.json, while the npm registry serves 3.3.5 as latest. The repository is a distribution and documentation surface, so its manifest is not the release of record.',
    },
    {
      id: 'disc-transport',
      summary: 'The edge is described two ways in the same repository.',
      detail:
        'The README’s architecture diagram shows the HTTP server reaching packages/mcp over stdio, while package.json describes the same artifact as an "HTTP reverse proxy forwarding MCP requests to the API server". The dependency list contains both a process runner and an HTTP client, so both mechanisms are present. The public material does not settle which one carries a tool call, and no reconciliation is invented here.',
    },
    {
      id: 'disc-source',
      summary: 'No implementation source is published in any of the three repositories.',
      detail:
        'All three hold documentation, a licence, a changelog, a package manifest and images. Build scripts reference a src/ directory that is not present, and only dist/ is shipped to npm. This is stated plainly by the CLI’s own README rather than being a gap in the audit.',
    },
  ],

  boundary:
    'This describes what is published, not the whole product. The public repositories establish package identity, protocol surface, execution paths and the location of the proprietary boundary. They do not establish the core implementation, adoption, usage volume, or production scale. No accuracy figure is published for the CLI’s AI-attributed change detection, which its README describes as a heuristic.',

  sources: [
    {
      id: 'vrk-src-architecture',
      kind: 'source',
      title: 'Published architecture and component responsibilities',
      description:
        'The four-layer diagram and responsibility table, at the revision this interaction was audited against.',
      href: `${MCP_SERVER_REPO}/blob/${MCP_SERVER_REV}/README.md`,
      verified: true,
    },
    {
      id: 'vrk-src-manifest',
      kind: 'source',
      title: 'Hosted edge package manifest',
      description:
        'Dependency list, entry point, deployment scripts, and the description that conflicts with the README.',
      href: `${MCP_SERVER_REPO}/blob/${MCP_SERVER_REV}/package.json`,
      verified: true,
    },
    {
      id: 'vrk-src-cli',
      kind: 'source',
      title: 'CLI distribution surface',
      description:
        'Commands, MCP integration config, design properties, and the statement that the implementation is not published here.',
      href: `${CLI_REPO}/blob/${CLI_REV}/README.md`,
      verified: true,
    },
  ],
};
