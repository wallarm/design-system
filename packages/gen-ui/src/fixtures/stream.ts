/**
 * Writes a recorded answer once and streams it in both formats. A scenario is the agent's layout,
 * in the chunks it would send them, with every figure bound to a path, plus the app's data for
 * those paths and when it arrives. `toStreams` turns it into A2UI messages and json-render patches,
 * each line marked with who sent it.
 */
import type { SpecStreamLine } from '@json-render/core';
import { type A2uiMessage, WALLARM_A2UI_CATALOG_ID } from '../a2ui/catalog';
import type { GenUiAction } from '../core/define';

/** A value the app fills: becomes `{ "@path" }` in A2UI and `{ "$state" }` in json-render. */
export const bind = (path: string) => ({ bind: path });
type Bound = ReturnType<typeof bind>;
const isBound = (v: unknown): v is Bound =>
  typeof v === 'object' && v !== null && 'bind' in v && Object.keys(v).length === 1;

/** One component in the agent's layout. */
export interface LayoutNode {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  children?: string[];
  /** For a Button: the action and its context, which may hold bindings too. */
  press?: { action: string; params: Record<string, unknown> };
}

export const node = (
  id: string,
  type: string,
  props: LayoutNode['props'] = {},
  children?: string[],
): LayoutNode => ({ id, type, props, children });

export interface Scenario {
  /** Stable id, e.g. for a URL. */
  id: string;
  /** What the user asked. */
  prompt: string;
  /** One line under the prompt in a picker: what the answer shows. */
  summary: string;
  surfaceId: string;
  actions: readonly GenUiAction[];
  /** The agent's components in arrival order, one array per chunk it sends. */
  layout: LayoutNode[][];
  /** The app's data: each batch arrives right after the layout chunk at `after` (its index). */
  data: { after: number; values: { path: string; value: unknown }[] }[];
}

/** Who sent a line: the agent (layout) or the app (data). */
export type StreamOrigin = 'agent' | 'app';
export interface StreamLine<T> {
  origin: StreamOrigin;
  line: T;
}

export interface ScenarioStreams {
  a2ui: StreamLine<A2uiMessage>[];
  jsonRender: StreamLine<SpecStreamLine>[];
}

const mapBindings = (value: unknown, to: (path: string) => unknown): unknown => {
  if (isBound(value)) return to(value.bind);
  if (Array.isArray(value)) return value.map(v => mapBindings(v, to));
  if (typeof value === 'object' && value !== null)
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapBindings(v, to)]));
  return value;
};

/** The agent's chunks in order, each data batch right after the chunk it follows. */
const interleave = <T>(
  start: T[],
  chunks: T[][],
  dataAfter: (index: number) => T[],
): StreamLine<T>[] => [
  ...start.map(line => ({ origin: 'agent' as const, line })),
  ...chunks.flatMap((chunk, i) => [
    ...chunk.map(line => ({ origin: 'agent' as const, line })),
    ...dataAfter(i).map(line => ({ origin: 'app' as const, line })),
  ]),
];

const toA2uiPath = (path: string) => ({ '@path': path });
const toJsonRenderPath = (path: string) => ({ $state: path });

const a2uiComponent = (n: LayoutNode) => ({
  id: n.id,
  component: n.type,
  ...(mapBindings(n.props, toA2uiPath) as Record<string, unknown>),
  ...(n.children ? { children: n.children } : {}),
  ...(n.press
    ? {
        press: {
          event: { name: n.press.action, context: mapBindings(n.press.params, toA2uiPath) },
        },
      }
    : {}),
});

const jsonRenderElement = (n: LayoutNode): SpecStreamLine => ({
  op: 'add',
  path: `/elements/${n.id}`,
  value: {
    type: n.type,
    props: mapBindings(n.props, toJsonRenderPath),
    children: n.children ?? [],
    ...(n.press
      ? {
          on: {
            press: {
              action: n.press.action,
              params: mapBindings(n.press.params, toJsonRenderPath),
            },
          },
        }
      : {}),
  },
});

/** The scenario as both formats stream it. The first layout chunk's first node is the root. */
export const toStreams = (s: Scenario): ScenarioStreams => {
  const dataAt = (i: number) => s.data.filter(d => d.after === i).flatMap(d => d.values);
  const rootId = s.layout[0]?.[0]?.id ?? 'root';
  return {
    a2ui: interleave<unknown>(
      [
        {
          version: '1.0',
          createSurface: { surfaceId: s.surfaceId, catalogId: WALLARM_A2UI_CATALOG_ID },
        },
      ],
      s.layout.map(chunk => [
        {
          version: '1.0',
          updateComponents: { surfaceId: s.surfaceId, components: chunk.map(a2uiComponent) },
        },
      ]),
      // One message per path: a second write to '/' would replace the first.
      i =>
        dataAt(i).map(d => ({
          version: '1.0',
          updateDataModel: { surfaceId: s.surfaceId, path: d.path, value: d.value },
        })),
    ) as StreamLine<A2uiMessage>[],
    jsonRender: [
      // An empty state first, so the surface mounts with somewhere to put the app's data.
      { origin: 'app', line: { op: 'add', path: '/state', value: {} } },
      ...interleave<SpecStreamLine>(
        [{ op: 'add', path: '/root', value: rootId }],
        s.layout.map(chunk => chunk.map(jsonRenderElement)),
        i => dataAt(i).map(d => ({ op: 'add', path: `/state${d.path}`, value: d.value })),
      ),
    ],
  };
};
