import type { Proof } from '@/lib/types';
import { PUBLISHED_SITES } from '../published';

/**
 * Copy is carried over from the Claude Design export verbatim unless noted.
 *
 * In the export every row pointed either at `#vreko`: the section the reader is
 * already in, or at the general GitHub profile. Neither is the artifact the row
 * names, so all four were unresolved.
 *
 * Each row's call to action now points at the published documentation on
 * `docs.vreko.dev`, because that is the artifact a reader can actually work through;
 * the repository stays as the pinned source underneath. Every destination below was
 * checked against the live docs: `/mcp` carries the tool surface and setup, `/mcp-tools`
 * the session flow, `/how-it-works` the observation and intelligence layers, and
 * `/configuration` the MCP integration and environment boundaries.
 *
 * The implementation is built from the proprietary Vreko core and is deliberately not
 * published, which is why the boundary below says what it says.
 */
const MCP_REPO = 'https://github.com/vreko-dev/mcp-server';
const DOCS = PUBLISHED_SITES.vrekoDocs;
export const vreko: Proof = {
  id: 'vreko',
  sectionId: 'vreko',
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
      label: 'Documentation',
      detail: 'MCP setup and the four tools',
      href: `${DOCS}/mcp`,
      verified: true,
      sourceHref: MCP_REPO,
      sourceLabel: 'vreko-dev/mcp-server',
      cta: 'OPEN DOCS',
    },
    {
      id: 'vreko-architecture',
      label: 'Architecture',
      detail: 'Transport → MCP protocol → intelligence layer',
      detailIsCode: true,
      href: `${DOCS}/how-it-works`,
      verified: true,
      sourceHref: `${MCP_REPO}#architecture`,
      sourceLabel: 'vreko-dev/mcp-server#architecture',
      cta: 'INSPECT',
    },
    {
      id: 'vreko-workflow',
      label: 'Agent workflow',
      detail: 'brief → pulse → learn → end',
      detailIsCode: true,
      href: `${DOCS}/mcp-tools`,
      verified: true,
      sourceHref: `${MCP_REPO}#what-is-vreko-mcp-server`,
      sourceLabel: 'vreko-dev/mcp-server#what-is-vreko-mcp-server',
      cta: 'INSPECT',
    },
    {
      id: 'vreko-deployment',
      label: 'Deployment',
      detail: 'local + hosted execution paths',
      href: `${DOCS}/configuration`,
      verified: true,
      sourceHref: `${MCP_REPO}#deployment-to-flyio`,
      sourceLabel: 'vreko-dev/mcp-server#deployment-to-flyio',
      cta: 'INSPECT',
    },
  ],
  evidence: [
    {
      id: 'vreko-ev-source',
      kind: 'source',
      title: 'Vreko MCP Server',
      description:
        'Published MCP documentation: the tool surface, the setup path, and how a compatible assistant verifies the connection. The repository carrying the package manifest and tool contracts is pinned as the source.',
      href: `${DOCS}/mcp`,
      verified: true,
      sourceHref: MCP_REPO,
      sourceLabel: 'vreko-dev/mcp-server',
    },
    {
      id: 'vreko-ev-architecture',
      kind: 'observed',
      title: 'Transport → MCP protocol → intelligence layer',
      description:
        'Separation between transport concerns, protocol surface, and the repository/session intelligence behind it.',
      href: `${DOCS}/how-it-works`,
      verified: true,
      sourceHref: `${MCP_REPO}#architecture`,
      sourceLabel: 'vreko-dev/mcp-server#architecture',
    },
    {
      id: 'vreko-ev-lifecycle',
      kind: 'observed',
      title: 'Agent lifecycle: brief → pulse → learn → end',
      description:
        'Session shape the server exposes to a compatible assistant, including where state is written and read.',
      href: `${DOCS}/mcp-tools`,
      verified: true,
      sourceHref: `${MCP_REPO}#what-is-vreko-mcp-server`,
      sourceLabel: 'vreko-dev/mcp-server#what-is-vreko-mcp-server',
    },
    {
      id: 'vreko-ev-deployed',
      kind: 'deployed',
      title: 'Local + hosted execution paths',
      description:
        'Two supported execution paths with distinct authentication and deployment boundaries.',
      href: `${DOCS}/configuration`,
      verified: true,
      sourceHref: `${MCP_REPO}#deployment-to-flyio`,
      sourceLabel: 'vreko-dev/mcp-server#deployment-to-flyio',
    },
  ],
  boundary:
    'The public repository establishes the protocol surface, the session contract and the deployment shape. The Vreko core is proprietary, so the implementation behind that surface is not open to inspection. It does not establish adoption, usage volume, or production scale.',
};
