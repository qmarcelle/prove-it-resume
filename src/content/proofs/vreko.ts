import type { Proof } from '@/lib/types';

/**
 * Copy is carried over from the Claude Design export verbatim unless noted.
 *
 * In the export every row pointed either at `#sec-02` — the section the reader is
 * already in — or at the general GitHub profile. Neither is the artifact the row
 * names, so all four were unresolved.
 *
 * They now point at exact destinations in `vreko-dev/mcp-server`, each confirmed to
 * be the artifact its row claims. The repository is the public distribution and
 * documentation surface for the `vreko-mcp-server` package; the implementation is
 * built from the proprietary Vreko core and is deliberately not published, which is
 * why the boundary below says what it says.
 */
const MCP_REPO = 'https://github.com/vreko-dev/mcp-server';
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
      href: MCP_REPO,
      verified: true,
      cta: 'OPEN GITHUB',
    },
    {
      id: 'vreko-architecture',
      label: 'Architecture',
      detail: 'Transport → MCP protocol → intelligence layer',
      detailIsCode: true,
      href: `${MCP_REPO}#architecture`,
      verified: true,
      cta: 'INSPECT',
    },
    {
      id: 'vreko-workflow',
      label: 'Agent workflow',
      detail: 'brief → pulse → learn → end',
      detailIsCode: true,
      href: `${MCP_REPO}#the-v2-agentic-workflow`,
      verified: true,
      cta: 'INSPECT',
    },
    {
      id: 'vreko-deployment',
      label: 'Deployment',
      detail: 'local + hosted execution paths',
      href: `${MCP_REPO}#deployment-to-flyio`,
      verified: true,
      cta: 'INSPECT',
    },
  ],
  evidence: [
    {
      id: 'vreko-ev-source',
      kind: 'source',
      title: 'Vreko MCP Server',
      description:
        'Public repository carrying the package manifest, tool contracts, configuration and documentation that ship with each release.',
      href: MCP_REPO,
      verified: true,
    },
    {
      id: 'vreko-ev-architecture',
      kind: 'observed',
      title: 'Transport → MCP protocol → intelligence layer',
      description:
        'Separation between transport concerns, protocol surface, and the repository/session intelligence behind it.',
      href: `${MCP_REPO}#architecture`,
      verified: true,
    },
    {
      id: 'vreko-ev-lifecycle',
      kind: 'observed',
      title: 'Agent lifecycle: brief → pulse → learn → end',
      description:
        'Session shape the server exposes to a compatible assistant, including where state is written and read.',
      href: `${MCP_REPO}#the-v2-agentic-workflow`,
      verified: true,
    },
    {
      id: 'vreko-ev-deployed',
      kind: 'deployed',
      title: 'Local + hosted execution paths',
      description:
        'Two supported execution paths with distinct authentication and deployment boundaries.',
      href: `${MCP_REPO}#deployment-to-flyio`,
      verified: true,
    },
  ],
  boundary:
    'The public repository establishes the protocol surface, the session contract and the deployment shape. The Vreko core is proprietary, so the implementation behind that surface is not open to inspection. It does not establish adoption, usage volume, or production scale.',
};
