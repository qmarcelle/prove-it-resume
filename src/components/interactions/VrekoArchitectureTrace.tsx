'use client';

import { useId, useState } from 'react';
import type {
  ArchitectureContainer,
  PublicationState,
  VrekoArchitectureData,
} from '@/lib/interactions';
import { EvidenceLink } from '@/components/evidence/EvidenceLink';
import { useDeepLinkedState } from './useDeepLinkedState';
import styles from './VrekoArchitectureTrace.module.css';

/**
 * Vreko architecture — semantic zoom over one diagram, plus a user-stepped request trace.
 *
 * The rule the design set and this keeps: **the box you opened stays the box you are
 * looking inside.** Expanding the system does not swap in a second, denser picture. The
 * same container keeps its label and its position; its interior grows downward and its
 * neighbours move around it. The reader never navigates away from the argument.
 *
 * Two deliberate departures from the storyboard:
 *
 * - **No ARIA tree.** The storyboard specified `role="treeitem"` because the diagram is
 *   visually nested. A tree brings an interaction contract — typeahead, one tab stop for
 *   the whole widget, Home/End across every node — that this content does not need and
 *   that would be worse if half-implemented. Nested `<button aria-expanded>` disclosures
 *   inside real lists say the same thing with semantics every screen reader already
 *   handles well.
 * - **No auto-advancing trace.** One user action is one boundary crossing, at every
 *   motion setting. A timed walk would imply throughput, which is a claim this section
 *   does not make.
 *
 * The publication state on every node is the point of the interaction. It is not
 * decoration: four of these packages resolve on the npm registry and nine return 404,
 * and the reader is given the command to check.
 */

/** Call-to-action wording per source, so no two links read the same. */
const SOURCE_CTA: Record<string, string> = {
  'vrk-src-architecture': 'INSPECT ARCHITECTURE',
  'vrk-src-manifest': 'INSPECT PACKAGE MANIFEST',
  'vrk-src-cli': 'INSPECT CLI SURFACE',
};

const PUBLICATION_LABEL: Record<PublicationState, string> = {
  public: 'PUBLIC',
  'declared-not-published': 'NOT PUBLISHED',
  external: 'EXTERNAL',
};

export function VrekoArchitectureTrace({ data }: { data: VrekoArchitectureData }) {
  const panelId = useId();

  /** Level 0 is the resting three-box view; level 1 opens the system in place. */
  const [expanded, setExpanded] = useDeepLinkedState(
    'architecture',
    'overview',
    (raw) => raw === 'overview' || raw === 'expanded',
  );
  const isExpanded = expanded === 'expanded';

  /** Which containers have had their interiors disclosed. Independent of the trace. */
  const [openContainers, setOpenContainers] = useState<readonly string[]>([]);

  /** null means the trace has not been started. Never advances on its own. */
  const [hop, setHop] = useState<number | null>(null);

  const toggleContainer = (id: string) => {
    setOpenContainers((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
    );
  };

  const collapse = () => {
    setExpanded('overview');
    setOpenContainers([]);
    setHop(null);
  };

  const activeHop = hop === null ? null : data.trace[hop];
  const activeContainerId = activeHop?.atContainerId ?? null;

  return (
    <section className={styles.wrap} aria-labelledby={`${panelId}-title`}>
      <div className={styles.header}>
        <h3 className={styles.title} id={`${panelId}-title`}>
          Public architecture
        </h3>
        <span className={styles.headerCode}>
          {data.publicPackages.length} PUBLISHED · {data.privatePackages.length} NOT
          PUBLISHED
        </span>
      </div>

      <p className={styles.question}>{data.question}</p>

      <div className={styles.diagram} id={panelId}>
        <Node
          container={data.external.upstream}
          tone="external"
          active={activeContainerId === data.external.upstream.id}
        />

        <Connector />

        {/*
         * The system box. At rest it is one node; expanded, the same node grows an
         * interior. Its heading and position are unchanged either way, which is what
         * makes this zoom rather than navigation.
         */}
        <div
          className={[
            styles.system,
            isExpanded ? styles.systemExpanded : '',
            activeContainerId !== null &&
            activeContainerId !== data.external.upstream.id &&
            activeContainerId !== data.external.downstream.id
              ? styles.systemActive
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className={styles.systemHead}>
            <div className={styles.systemIdentity}>
              <span className={styles.nodeKind}>SYSTEM UNDER DESCRIPTION</span>
              <span className={styles.systemName}>{data.system.name}</span>
              {data.system.identifier ? (
                <span className={styles.identifier}>{data.system.identifier}</span>
              ) : null}
            </div>

            <button
              type="button"
              className={styles.zoom}
              aria-expanded={isExpanded}
              aria-controls={`${panelId}-interior`}
              onClick={() => (isExpanded ? collapse() : setExpanded('expanded'))}
            >
              {isExpanded ? 'Collapse' : 'Explore architecture'}
            </button>
          </div>

          <p className={styles.systemSummary}>{data.system.summary}</p>

          {isExpanded ? (
            <div className={styles.interior} id={`${panelId}-interior`}>
              {data.containers.map((container) => (
                <Container
                  key={container.id}
                  container={container}
                  open={openContainers.includes(container.id)}
                  onToggle={() => toggleContainer(container.id)}
                  active={activeContainerId === container.id}
                />
              ))}
            </div>
          ) : null}
        </div>

        <Connector />

        <Node
          container={data.external.downstream}
          tone="external"
          active={activeContainerId === data.external.downstream.id}
        />
      </div>

      {/* ---- The request trace ---- */}
      <div className={styles.traceBlock}>
        <div className={styles.traceHead}>
          <span className={styles.sectionLabel}>Trace one request</span>
          <div className={styles.traceControls}>
            {hop === null ? (
              <button
                type="button"
                className={styles.traceButton}
                onClick={() => {
                  setExpanded('expanded');
                  setHop(0);
                }}
              >
                Trace a request
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.traceButton}
                  onClick={() => setHop((h) => Math.max(0, (h ?? 0) - 1))}
                  disabled={hop === 0}
                >
                  ← Previous hop
                </button>
                <span className={styles.tracePosition} aria-hidden="true">
                  {hop + 1} / {data.trace.length}
                </span>
                <button
                  type="button"
                  className={styles.traceButton}
                  onClick={() =>
                    setHop((h) => Math.min(data.trace.length - 1, (h ?? 0) + 1))
                  }
                  disabled={hop === data.trace.length - 1}
                >
                  Next hop →
                </button>
                <button
                  type="button"
                  className={styles.traceReset}
                  onClick={() => setHop(null)}
                >
                  Reset trace
                </button>
              </>
            )}
          </div>
        </div>

        <p className="visually-hidden" role="status">
          {activeHop
            ? `Hop ${(hop ?? 0) + 1} of ${data.trace.length}: ${activeHop.label}. Boundary: ${activeHop.boundary}.`
            : 'Trace not started.'}
        </p>

        {activeHop ? (
          <div className={styles.hop}>
            <span className={styles.hopLabel}>{activeHop.label}</span>
            <dl className={styles.hopDetail}>
              <div className={styles.hopRow}>
                <dt>BOUNDARY</dt>
                <dd>{activeHop.boundary}</dd>
              </div>
              <div className={styles.hopRow}>
                <dt>CARRIES</dt>
                <dd>{activeHop.carries}</dd>
              </div>
              {activeHop.withheld ? (
                <div className={styles.hopRow}>
                  <dt>OUTSIDE IT</dt>
                  <dd>{activeHop.withheld}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : (
          <p className={styles.traceHint}>
            Five hops, stepped one at a time. Nothing advances on a timer — a request
            crossing a boundary is a fact about structure, not about speed.
          </p>
        )}
      </div>

      {/* ---- The boundary, checkable ---- */}
      <div className={styles.boundaryBlock}>
        <span className={styles.sectionLabel}>Where the public boundary falls</span>
        <div className={styles.packages}>
          <div className={styles.packageColumn}>
            <span className={styles.packageHeading}>Published</span>
            <ul className={styles.packageList}>
              {data.publicPackages.map((pkg) => (
                <li key={pkg.name}>
                  <span className={styles.packageName}>{pkg.name}</span>
                  <span className={styles.packageVersion}>{pkg.version}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.packageColumn}>
            <span className={styles.packageHeading}>Depended on, not published</span>
            <ul className={styles.packageList}>
              {data.privatePackages.map((name) => (
                <li key={name}>
                  <span className={styles.packageNameQuiet}>{name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className={styles.verifyMethod}>{data.boundaryVerification.method}</p>
        {data.boundaryVerification.command ? (
          <code className={styles.command}>{data.boundaryVerification.command}</code>
        ) : null}
      </div>

      {/* ---- Recorded contradictions in the public material ---- */}
      <div className={styles.discrepancies}>
        <span className={styles.sectionLabel}>
          Where the public material disagrees with itself
        </span>
        <ul className={styles.discrepancyList}>
          {data.discrepancies.map((item) => (
            <li className={styles.discrepancy} key={item.id}>
              <span className={styles.discrepancySummary}>{item.summary}</span>
              <p className={styles.discrepancyDetail}>{item.detail}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.footer}>
        <p className={styles.boundary}>
          <span className={styles.boundaryLabel}>WHAT THIS DOES NOT SHOW</span>
          {data.boundary}
        </p>
        <div className={styles.sources}>
          {data.sources.map((source) => (
            <EvidenceLink
              key={source.id}
              reference={source}
              /*
               * Each link names the artifact it opens. Three identical "INSPECT SOURCE"
               * calls to action would leave a reader guessing which one is the
               * architecture and which one is the manifest — which is the same failure
               * the evidence rule exists to prevent, one level down.
               */
              cta={SOURCE_CTA[source.id] ?? 'INSPECT SOURCE'}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** An external box: named, but explicitly not part of the system under description. */
function Node({
  container,
  tone,
  active,
}: {
  container: ArchitectureContainer;
  tone: 'external';
  active: boolean;
}) {
  return (
    <div
      className={[styles.node, styles[tone], active ? styles.nodeActive : '']
        .filter(Boolean)
        .join(' ')}
    >
      <span className={styles.nodeKind}>{PUBLICATION_LABEL.external}</span>
      <span className={styles.nodeName}>{container.name}</span>
      {container.identifier ? (
        <span className={styles.identifier}>{container.identifier}</span>
      ) : null}
      <p className={styles.nodeSummary}>{container.summary}</p>
    </div>
  );
}

/** One container inside the system, with its interior available on demand. */
function Container({
  container,
  open,
  onToggle,
  active,
}: {
  container: ArchitectureContainer;
  open: boolean;
  onToggle: () => void;
  active: boolean;
}) {
  const id = useId();

  return (
    <div
      className={[
        styles.container,
        active ? styles.containerActive : '',
        container.publication === 'declared-not-published' ? styles.containerSealed : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.containerHead}>
        <div className={styles.containerIdentity}>
          <span className={styles.publication}>
            {PUBLICATION_LABEL[container.publication]}
          </span>
          <span className={styles.containerName}>{container.name}</span>
          {container.identifier ? (
            <span className={styles.identifier}>{container.identifier}</span>
          ) : null}
        </div>

        <button
          type="button"
          className={styles.disclose}
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
        >
          {open ? 'Hide internals' : 'Show internals'}
        </button>
      </div>

      <p className={styles.containerSummary}>{container.summary}</p>

      {open ? (
        <div className={styles.components} id={id}>
          <ul className={styles.componentList}>
            {container.components.map((component) => (
              <li className={styles.component} key={component.id}>
                <div className={styles.componentHead}>
                  <span className={styles.componentName}>{component.name}</span>
                  {component.identifier ? (
                    <span className={styles.identifier}>{component.identifier}</span>
                  ) : null}
                  <span className={styles.publicationQuiet}>
                    {PUBLICATION_LABEL[component.publication]}
                  </span>
                </div>
                <p className={styles.componentBody}>{component.responsibility}</p>
              </li>
            ))}
          </ul>
          <p className={styles.containerProvenance}>
            {container.provenance.source}
            {container.provenance.revision
              ? ` @ ${container.provenance.revision.slice(0, 8)}`
              : ''}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function Connector() {
  return (
    <div className={styles.connector} aria-hidden="true">
      <span className={styles.connectorRule} />↓
    </div>
  );
}
