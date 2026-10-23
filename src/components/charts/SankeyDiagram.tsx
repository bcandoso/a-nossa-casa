import { useEffect, useMemo, useState } from 'react';
import {
  sankey,
  sankeyJustify,
  sankeyLinkHorizontal,
  type SankeyLink as D3SankeyLink,
  type SankeyNode as D3SankeyNode,
} from 'd3-sankey';
import type { SankeyLinkInput, SankeyNodeInput } from '@/domain/types';
import { useTooltipPosition } from '@/hooks/useTooltipPosition';
import { pt } from '@/i18n/pt-PT';
import styles from './SankeyDiagram.module.css';

const NODE_WIDTH = 12;
const NODE_PADDING = 18;
const LABEL_GUTTER = 8;
const SIDE_LABEL_SPACE = 124;
const NEUTRAL = '#64748b';

type NodeExtra = SankeyNodeInput;
type LinkExtra = Record<string, never>;
type LaidOutNode = D3SankeyNode<NodeExtra, LinkExtra>;
type LaidOutLink = D3SankeyLink<NodeExtra, LinkExtra>;

interface TooltipState {
  title: string;
  rows: { color: string; label: string; value: string }[];
}

const nodeOf = (end: LaidOutLink['source']): LaidOutNode => end as LaidOutNode;

export function SankeyDiagram({
  nodes,
  links,
  height = 320,
  formatValue = (value) => String(Math.round(value)),
  formatTooltipValue,
  legend,
  className,
  emptyMessage,
}: {
  nodes: SankeyNodeInput[];
  links: SankeyLinkInput[];
  height?: number;
  formatValue?: (value: number) => string;
  formatTooltipValue?: (value: number) => string;
  legend?: { label: string; color: string }[];
  className?: string;
  emptyMessage: string;
}) {
  const { hostRef, setPosition, clearPosition } = useTooltipPosition();
  const [width, setWidth] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    setWidth(el.clientWidth);
    return () => observer.disconnect();
  }, [hostRef]);

  const graph = useMemo(() => {
    if (width <= 0) return null;
    const byId = new Map(nodes.map((node) => [node.id, node]));
    const usable = links.filter(
      (link) => Number.isFinite(link.value) && link.value > 0 && byId.has(link.source) && byId.has(link.target),
    );
    if (!usable.length) return { nodes: [] as LaidOutNode[], links: [] as LaidOutLink[] };

    const connected = new Set(usable.flatMap((link) => [link.source, link.target]));
    const band = Math.max(60, width - SIDE_LABEL_SPACE * 2);

    try {
      const layout = sankey<NodeExtra, LinkExtra>()
        .nodeId((node) => node.id)
        .nodeAlign(sankeyJustify)
        .nodeWidth(NODE_WIDTH)
        .nodePadding(NODE_PADDING)
        .extent([
          [SIDE_LABEL_SPACE, 2],
          [SIDE_LABEL_SPACE + band, Math.max(20, height - 2)],
        ]);

      return layout({
        nodes: nodes.filter((node) => connected.has(node.id)).map((node) => ({ ...node })),
        links: usable.map((link) => ({ ...link })),
      } as never);
    } catch {
      return { nodes: [] as LaidOutNode[], links: [] as LaidOutLink[] };
    }
  }, [nodes, links, width, height]);

  const linkPath = useMemo(() => sankeyLinkHorizontal<NodeExtra, LinkExtra>(), []);
  const formatTip = formatTooltipValue ?? formatValue;

  const labelY = useMemo(() => {
    const out = new Map<string, number>();
    if (!graph?.nodes.length) return out;

    const columns = new Map<number, LaidOutNode[]>();
    for (const node of graph.nodes) {
      const depth = node.depth ?? 0;
      const bucket = columns.get(depth);
      if (bucket) bucket.push(node);
      else columns.set(depth, [node]);
    }

    for (const [, column] of columns) {
      const sorted = [...column].sort((a, b) => (a.y0 ?? 0) - (b.y0 ?? 0));
      const gap = sorted.some((node) => node.note) ? 40 : 28;
      const half = gap / 2;
      const ys = sorted.map((node) => ((node.y0 ?? 0) + (node.y1 ?? 0)) / 2);

      for (let i = 1; i < ys.length; i += 1) {
        const previous = ys[i - 1] ?? 0;
        ys[i] = Math.max(ys[i] ?? 0, previous + gap);
      }
      for (let i = ys.length - 1; i >= 0; i -= 1) {
        const ceiling = i === ys.length - 1 ? height - half : (ys[i + 1] ?? height) - gap;
        ys[i] = Math.min(ys[i] ?? 0, ceiling);
      }
      ys[0] = Math.max(ys[0] ?? 0, half);

      sorted.forEach((node, i) => out.set(node.id, ys[i] ?? 0));
    }
    return out;
  }, [graph, height]);

  const dimmed = (ids: string[]) => hovered != null && !ids.includes(hovered);
  const isEmpty = graph != null && graph.nodes.length === 0;

  return (
    <div ref={hostRef} className={[styles.host, className].filter(Boolean).join(' ')}>
      {legend?.length ? (
        <div className={styles.legend}>
          {legend.map((item) => (
            <span key={item.label} className={styles.legendItem}>
              <svg className={styles.swatch} viewBox="0 0 10 10" aria-hidden>
                <circle cx="5" cy="5" r="5" fill={item.color} />
              </svg>
              {item.label}
            </span>
          ))}
        </div>
      ) : null}

      {isEmpty ? (
        <p className={styles.empty}>{emptyMessage}</p>
      ) : (
        <svg width="100%" height={height} role="img" className={styles.svg}>
          <defs>
            {(graph?.links ?? []).map((link, index) => {
              const source = nodeOf(link.source);
              const target = nodeOf(link.target);
              return (
                <linearGradient
                  key={index}
                  id={`sankey-grad-${index}`}
                  gradientUnits="userSpaceOnUse"
                  x1={source.x1}
                  x2={target.x0}
                >
                  <stop offset="0%" stopColor={source.color ?? NEUTRAL} />
                  <stop offset="100%" stopColor={target.color ?? NEUTRAL} />
                </linearGradient>
              );
            })}
          </defs>

          <g fill="none">
            {(graph?.links ?? []).map((link, index) => {
              const source = nodeOf(link.source);
              const target = nodeOf(link.target);
              const isDimmed = dimmed([source.id, target.id]);
              return (
                <path
                  key={index}
                  d={linkPath(link) ?? undefined}
                  stroke={`url(#sankey-grad-${index})`}
                  strokeWidth={Math.max(1, link.width ?? 1)}
                  className={[styles.link, isDimmed ? styles.dimmedLink : styles.liveLink].join(' ')}
                  onMouseEnter={(event) => {
                    setHovered(source.id);
                    setPosition(event.clientX, event.clientY);
                    setTooltip({
                      title: `${source.label} → ${target.label}`,
                      rows: [{ color: source.color ?? NEUTRAL, label: pt.sankey.flow, value: formatTip(link.value ?? 0) }],
                    });
                  }}
                  onMouseMove={(event) => setPosition(event.clientX, event.clientY)}
                  onMouseLeave={() => {
                    setHovered(null);
                    setTooltip(null);
                    clearPosition();
                  }}
                />
              );
            })}
          </g>

          {(graph?.nodes ?? []).map((node) => {
            const depth = node.depth ?? 0;
            const x0 = node.x0 ?? 0;
            const x1 = node.x1 ?? 0;
            const y0 = node.y0 ?? 0;
            const y1 = node.y1 ?? 0;
            const outward = depth === 0;
            const labelX = outward ? x0 - LABEL_GUTTER : x1 + LABEL_GUTTER;
            const anchor = outward ? 'end' : 'start';
            return (
              <g
                key={node.id}
                className={[styles.node, dimmed([node.id]) ? styles.dimmedNode : ''].join(' ')}
                onMouseEnter={(event) => {
                  setHovered(node.id);
                  setPosition(event.clientX, event.clientY);
                  setTooltip({
                    title: node.label,
                    rows: [
                      {
                        color: node.color ?? NEUTRAL,
                        label: pt.sankey.total,
                        value: formatTip(node.displayValue ?? node.value ?? 0),
                      },
                    ],
                  });
                }}
                onMouseLeave={() => {
                  setHovered(null);
                  setTooltip(null);
                  clearPosition();
                }}
              >
                <rect x={x0} y={y0} width={x1 - x0} height={Math.max(1, y1 - y0)} rx={4} fill={node.color ?? NEUTRAL} />
                <text
                  x={labelX}
                  y={labelY.get(node.id) ?? (y0 + y1) / 2}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  className={styles.label}
                >
                  <tspan x={labelX} dy={node.note ? '-0.6em' : '-0.1em'} className={styles.labelName}>
                    {node.label}
                  </tspan>
                  <tspan x={labelX} dy="1.2em" className={styles.labelValue}>
                    {formatValue(node.displayValue ?? node.value ?? 0)}
                  </tspan>
                  {node.note ? (
                    <tspan x={labelX} dy="1.2em" className={styles.labelNote}>
                      {node.note}
                    </tspan>
                  ) : null}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {tooltip ? (
        <div className={styles.tooltip}>
          <div className={styles.tooltipTitle}>{tooltip.title}</div>
          {tooltip.rows.map((row) => (
            <div key={row.label} className={styles.tooltipRow}>
              <svg className={styles.swatch} viewBox="0 0 10 10" aria-hidden>
                <circle cx="5" cy="5" r="5" fill={row.color} />
              </svg>
              <span className={styles.tooltipLabel}>{row.label}:</span>
              <span className={styles.tooltipValue}>{row.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
