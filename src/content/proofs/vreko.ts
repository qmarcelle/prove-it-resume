import type { Proof } from '@/lib/types';

/**
 * Copy is carried over from the Claude Design export verbatim unless noted.
 *
 * Every `href` here is absent and every row is `verified: false`. In the export these
 * rows pointed either at `#sec-02` — the section the reader is already in — or at the
 * general GitHub profile. Neither is the artifact the row names, so under the
 * evidence-integrity rule they are unresolved until exact URLs are supplied.
 */
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
      verified: false,
      cta: 'OPEN GITHUB',
    },
    {
      id: 'vreko-architecture',
      label: 'Architecture',
      detail: 'Transport → MCP protocol → intelligence layer',
      detailIsCode: true,
      verified: false,
      cta: 'INSPECT',
    },
    {
      id: 'vreko-workflow',
      label: 'Agent workflow',
      detail: 'brief → pulse → learn → end',
      detailIsCode: true,
      verified: false,
      cta: 'INSPECT',
    },
    {
      id: 'vreko-deployment',
      label: 'Deployment',
      detail: 'local + hosted execution paths',
      verified: false,
      cta: 'INSPECT',
    },
  ],
  evidence: [
    {
      id: 'vreko-ev-source',
      kind: 'source',
      title: 'Vreko MCP Server',
      description:
        'Public repository containing the server implementation, tool contracts, and configuration.',
      verified: false,
    },
    {
      id: 'vreko-ev-architecture',
      kind: 'observed',
      title: 'Transport → MCP protocol → intelligence layer',
      description:
        'Separation between transport concerns, protocol surface, and the repository/session intelligence behind it.',
      verified: false,
    },
    {
      id: 'vreko-ev-lifecycle',
      kind: 'observed',
      title: 'Agent lifecycle: brief → pulse → learn → end',
      description:
        'Session shape the server exposes to a compatible assistant, including where state is written and read.',
      verified: false,
    },
    {
      id: 'vreko-ev-deployed',
      kind: 'deployed',
      title: 'Local + hosted execution paths',
      description:
        'Two supported execution paths with distinct authentication and deployment boundaries.',
      verified: false,
    },
  ],
  boundary:
    'Public source establishes that the system exists and how it is built. It does not establish adoption, usage volume, or production scale outside the repositories where it has been applied.',
};
