'use client';

import { useMemo } from 'react';
import type {
  ArchitectureContainer,
  TraceHop,
  VrekoArchitectureData,
} from '@/lib/interactions';
import { CopyViewLink } from './CopyViewLink';
import { useDeepLinkedState } from './useDeepLinkedState';
import { CopyableCommand } from './CopyableCommand';
import styles from './VrekoArchitectureTrace.module.css';

/**
 * Vreko as containment: nested boundaries, opened in place.
 *
 * The previous version was a semantic zoom with a separate stepped trace beneath it —
 * expand the system, then walk a request through it hop by hop. Two controls, two
 * mental models, and the trace's hops were a list you read *after* the diagram rather
 * than something the diagram showed.
 *
 * The redesign collapses both into one: every layer is drawn where it actually sits,
 * inside or outside the publication boundary, and selecting one puts its hop detail in
 * the panel beside it. The boundary is the diagram's own geometry — solid stroke for
 * published, dashed for declared-but-unpublished, hairline for outside the system — so
 * the public/private split is read off the picture rather than off a legend of badges.
 *
 * What did not change is the evidence. Every layer, hop, publication state and
 * discrepancy is the same record it was; this rearranges how they are reached.
 *
 * Selection, not expansion, is the state — one layer is always selected, so the panel
 * is never empty and there is no "nothing here yet" frame to design around.
 */
export function VrekoArchitectureTrace({
  data,
  shareAnchor,
}: {
  data: VrekoArchitectureData;
  /** Section anchor for the shareable address. Absent means no share control. */
  shareAnchor?: string;
}) {
  const { external, system, containers, trace } = data;

  /** Draw order, outside → in → outside. Ids come from the content, not from here. */
  const layers = useMemo(
    () => [external.upstream, ...containers, external.downstream],
    [external.upstream, external.downstream, containers],
  );

  const [selectedId, setSelectedId] = useDeepLinkedState('layer', 'hosted-edge', (raw) =>
    layers.some((layer) => layer.id === raw),
  );

  const selected =
    layers.find((layer) => layer.id === selectedId) ??
    layers.find((layer) => layer.id === 'hosted-edge') ??
    layers[0];

  /*
   * The hop is joined to the container rather than stored on it. A hop describes a
   * *crossing into* a layer, and not every layer has one — the local edge is a second
   * entry point rather than a further boundary inward — so the panel renders the
   * crossing fields only where a crossing was actually recorded.
   */
  const hop = trace.find((entry) => entry.atContainerId === selected.id);

  const byId = (id: string) => containers.find((container) => container.id === id);
  const hosted = byId('hosted-edge');
  const local = byId('local-edge');
  const protocol = byId('protocol-surface');
  const platform = byId('platform');

  return (
    <div className={styles.wrap}>
      <div className={styles.diagram}>
        <Legend shareAnchor={shareAnchor} />

        <OutsideNode
          container={external.upstream}
          selected={selected.id === external.upstream.id}
          onSelect={setSelectedId}
        />
        <Flow>↓ JSON-RPC + workspace path</Flow>

        <div className={styles.system}>
          <div className={styles.systemHead}>
            <span className={styles.systemName}>{system.name}</span>
            <span className={styles.systemId}>{system.identifier}</span>
          </div>

          <div className={styles.edges}>
            {hosted ? (
              <LayerNode
                container={hosted}
                selected={selected.id === hosted.id}
                onSelect={setSelectedId}
              />
            ) : null}
            {local ? (
              <LayerNode
                container={local}
                selected={selected.id === local.id}
                onSelect={setSelectedId}
              />
            ) : null}
          </div>

          <Flow>↓ both edges converge</Flow>

          {protocol ? (
            <LayerNode
              container={protocol}
              selected={selected.id === protocol.id}
              onSelect={setSelectedId}
              wide
            />
          ) : null}

          {platform ? (
            <LayerNode
              container={platform}
              selected={selected.id === platform.id}
              onSelect={setSelectedId}
              wide
            />
          ) : null}
        </div>

        <Flow>↓ reads the repository at the supplied path</Flow>
        <OutsideNode
          container={external.downstream}
          selected={selected.id === external.downstream.id}
          onSelect={setSelectedId}
        />
      </div>

      <DetailPanel container={selected} hop={hop} data={data} />
    </div>
  );
}

/**
 * The publication key, and the one control that turns the selected layer into an
 * address. The legend row is where the diagram's own vocabulary is explained, which
 * makes it the row a reader is already reading when they decide this is worth sending
 * to someone.
 */
function Legend({ shareAnchor }: { shareAnchor?: string }) {
  return (
    <div className={styles.legend}>
      <span className={styles.legendTitle}>PUBLICATION BOUNDARY MODEL</span>
      <span className={styles.legendItem}>
        <span className={`${styles.swatch} ${styles.swatchPublic}`} aria-hidden="true" />
        PUBLISHED
      </span>
      <span className={styles.legendItem}>
        <span
          className={`${styles.swatch} ${styles.swatchDeclared}`}
          aria-hidden="true"
        />
        DECLARED, NOT PUBLISHED
      </span>
      <span className={styles.legendItem}>
        <span
          className={`${styles.swatch} ${styles.swatchExternal}`}
          aria-hidden="true"
        />
        OUTSIDE THE SYSTEM
      </span>

      {shareAnchor ? (
        <span className={styles.legendShare}>
          <CopyViewLink anchor={shareAnchor} />
        </span>
      ) : null}
    </div>
  );
}

function Flow({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.flow} aria-hidden="true">
      <span>{children}</span>
    </div>
  );
}

/** Publication state, spelled out. Never inferred from the stroke alone. */
const PUBLICATION_LABEL: Record<string, string> = {
  public: 'PUBLISHED',
  'declared-not-published': 'DECLARED, NOT PUBLISHED',
  external: 'OUTSIDE',
};

function OutsideNode({
  container,
  selected,
  onSelect,
}: {
  container: ArchitectureContainer;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      className={`${styles.outside} ${selected ? styles.outsideSelected : ''}`}
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(container.id)}
    >
      <span className={styles.nodeName}>{container.name}</span>
      <span className={styles.nodeMeta}>
        {container.identifier} · {PUBLICATION_LABEL[container.publication]}
      </span>
    </button>
  );
}

/**
 * One layer inside the system boundary.
 *
 * The selection marker is a separate element rather than a border colour change: a
 * border that changes colour on selection competes with the stroke that encodes
 * publication state, and the publication stroke is the one carrying evidence.
 */
function LayerNode({
  container,
  selected,
  onSelect,
  wide = false,
}: {
  container: ArchitectureContainer;
  selected: boolean;
  onSelect: (id: string) => void;
  wide?: boolean;
}) {
  const declared = container.publication === 'declared-not-published';

  return (
    <div className={`${styles.layer} ${wide ? styles.layerWide : ''}`}>
      <span
        className={`${styles.marker} ${selected ? styles.markerOn : ''}`}
        aria-hidden="true"
      />
      <div className={`${styles.layerBox} ${declared ? styles.layerDeclared : ''}`}>
        <button
          className={styles.layerButton}
          type="button"
          aria-pressed={selected}
          onClick={() => onSelect(container.id)}
        >
          <span className={styles.nodeName}>{container.name}</span>
          <span className={styles.nodeMeta}>
            {container.identifier} · {PUBLICATION_LABEL[container.publication]}
          </span>
        </button>

        {selected ? (
          <ul className={styles.components}>
            {container.components.map((component) => {
              const unpublished = component.publication === 'declared-not-published';
              return (
                <li className={styles.component} key={component.id}>
                  <span
                    className={`${styles.bullet} ${unpublished ? styles.bulletQuiet : ''}`}
                    aria-hidden="true"
                  >
                    {unpublished ? '▫' : '▪'}
                  </span>
                  <span className={styles.componentBody}>
                    {component.name}
                    {component.identifier ? (
                      <span className={styles.componentId}>
                        {' '}
                        — {component.identifier}
                      </span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

/**
 * The selected layer, in full, beside the diagram.
 *
 * `aria-live="polite"` because selection changes this region without moving focus: a
 * reader driving the diagram from the keyboard would otherwise click a layer and be
 * told nothing at all.
 */
function DetailPanel({
  container,
  hop,
  data,
}: {
  container: ArchitectureContainer;
  hop: TraceHop | undefined;
  data: VrekoArchitectureData;
}) {
  return (
    <aside className={styles.panel} aria-live="polite">
      <div className={styles.panelHead}>
        <span className={styles.panelEyebrow}>SELECTED LAYER</span>
        <h3 className={styles.panelTitle}>{container.name}</h3>
        <span className={styles.panelId}>
          {container.identifier} · {PUBLICATION_LABEL[container.publication]}
        </span>
      </div>

      <p className={styles.panelSummary}>{container.summary}</p>

      <div className={styles.panelFields}>
        {hop ? (
          <>
            <Field label="BOUNDARY CROSSED" strong>
              {hop.boundary}
            </Field>
            <Field label="CARRIES">{hop.carries}</Field>
          </>
        ) : null}

        {hop?.withheld ? (
          <div className={styles.withheld}>
            <span className={styles.withheldLabel}>WITHHELD</span>
            <p className={styles.withheldBody}>{hop.withheld}</p>
          </div>
        ) : null}

        <Field label="PROVENANCE" mono>
          {container.provenance.source}
          {container.provenance.revision
            ? ` @ ${container.provenance.revision.slice(0, 7)}`
            : ''}
        </Field>
      </div>

      <div className={styles.rederive}>
        <span className={styles.panelEyebrow}>RE-DERIVE THE SPLIT</span>
        {/*
         * Guarded, where the previous `<code>` was not: `command` is optional on
         * `Verification`, and without a guard an absent one rendered an empty bordered
         * box that looked like a command someone had forgotten to fill in.
         */}
        {data.boundaryVerification.command ? (
          <CopyableCommand
            className={styles.command}
            command={data.boundaryVerification.command}
          />
        ) : null}
        <p className={styles.rederiveBody}>{data.boundaryVerification.method}</p>
      </div>
    </aside>
  );
}

function Field({
  label,
  children,
  strong = false,
  mono = false,
}: {
  label: string;
  children: React.ReactNode;
  strong?: boolean;
  mono?: boolean;
}) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <p
        className={`${styles.fieldBody} ${strong ? styles.fieldStrong : ''} ${mono ? styles.fieldMono : ''}`}
      >
        {children}
      </p>
    </div>
  );
}
