import type { EditorState, Extension } from '@codemirror/state';
import {
  type EditorView,
  type HoverTooltipSource,
  hoverTooltip,
  type Tooltip,
} from '@codemirror/view';
import type { JsonSchema } from '../../types';
import { getJsonPointers, type JsonRegion, readRegionData } from '../languages/jsonPointers';
import { getCompiledSchema } from './loadSchema';

interface HoverTarget {
  pointer: string;
  from: number;
  to: number;
}

const CONTAINER_START = /^[[{]/;

/**
 * The property under `pos`: its key, or a primitive value. Objects and arrays are only
 * matched through their key, so hovering inside an object does not describe the object.
 */
const hoverTargetAt = (state: EditorState, pos: number, region: JsonRegion): HoverTarget | null => {
  let best: HoverTarget | null = null;
  const consider = (candidate: HoverTarget) => {
    if (pos < candidate.from || pos > candidate.to) return;
    if (!best || candidate.to - candidate.from < best.to - best.from) best = candidate;
  };
  for (const entry of getJsonPointers(state, region).values()) {
    if (entry.keyFrom !== undefined && entry.keyTo !== undefined) {
      consider({ pointer: entry.pointer, from: entry.keyFrom, to: entry.keyTo });
    }
    const isContainer = CONTAINER_START.test(state.sliceDoc(entry.valueFrom, entry.valueFrom + 1));
    if (!isContainer) {
      consider({ pointer: entry.pointer, from: entry.valueFrom, to: entry.valueTo });
    }
  }
  return best;
};

const textOf = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value : undefined;

/** Plain DOM (no innerHTML): title and description are schema text, never markup. */
const renderHover = (title: string | undefined, description: string | undefined): HTMLElement => {
  const dom = document.createElement('div');
  dom.className = 'flex max-w-[320px] flex-col gap-4 px-8 py-4 text-xs text-text-primary-alt';
  dom.setAttribute('data-schema-hover', '');
  if (title) {
    const heading = document.createElement('div');
    heading.className = 'font-medium';
    heading.textContent = title;
    dom.append(heading);
  }
  if (description) {
    const body = document.createElement('div');
    body.className = 'whitespace-pre-wrap text-text-primary-alt';
    body.textContent = description;
    dom.append(body);
  }
  return dom;
};

const hoverFor = async (
  state: EditorState,
  pos: number,
  getRegion: (state: EditorState) => JsonRegion | null,
  schema: JsonSchema,
): Promise<Tooltip | null> => {
  const region = getRegion(state);
  if (!region || pos < region.from || pos > region.to) return null;
  const target = hoverTargetAt(state, pos, region);
  if (!target) return null;

  const root = await getCompiledSchema(schema);
  // `getNode` reduces every parent (allOf / oneOf / if) against the data on the way down.
  const { node } = root.getNode(target.pointer, readRegionData(state, region));
  if (!node) return null;
  const title = textOf(node.schema.title);
  const description = textOf(node.schema.description);
  if (!title && !description) return null;

  return {
    pos: target.from,
    end: target.to,
    above: true,
    create: () => ({ dom: renderHover(title, description) }),
  };
};

/** Hover source: `title` / `description` of the schema for the property under the pointer. */
export const schemaHoverSource =
  (
    getSchema: () => JsonSchema | undefined,
    getRegion: (state: EditorState) => { from: number; to: number } | null,
  ): HoverTooltipSource =>
  (view: EditorView, pos: number): Promise<Tooltip | null> => {
    const schema = getSchema();
    if (schema === undefined) return Promise.resolve(null);
    // A broken schema or a failed chunk load must not reject on every hover.
    return hoverFor(view.state, pos, getRegion, schema).catch(() => null);
  };

export const schemaHover = (
  getSchema: () => JsonSchema | undefined,
  getRegion: (state: EditorState) => { from: number; to: number } | null,
): Extension => [hoverTooltip(schemaHoverSource(getSchema, getRegion))];
