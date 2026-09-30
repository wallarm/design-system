import { ensureSyntaxTree, syntaxTree } from '@codemirror/language';
import type { EditorState } from '@codemirror/state';
import type { SyntaxNode } from '@lezer/common';

/** Absolute document offsets of one JSON value (and of its key, for object members). */
export interface JsonPointerEntry {
  pointer: string;
  keyFrom?: number;
  keyTo?: number;
  valueFrom: number;
  valueTo: number;
}

interface JsonRegion {
  from: number;
  to: number;
}

/** Lezer JSON node names that are complete values (error nodes `⚠` are not). */
const VALUE_NODE_NAMES: ReadonlySet<string> = new Set([
  'Object',
  'Array',
  'String',
  'Number',
  'True',
  'False',
  'Null',
]);

/** Upper bound for the parse work a pointer lookup may force, in ms. */
const ENSURE_TREE_TIMEOUT = 200;

/** RFC 6901 reference-token escaping: `~` → `~0`, `/` → `~1`. */
export const escapePointerSegment = (segment: string): string =>
  segment.replaceAll('~', '~0').replaceAll('/', '~1');

const isValueNode = (node: SyntaxNode): boolean => VALUE_NODE_NAMES.has(node.name);

/** Decoded text of a `PropertyName` / `String` node; the raw inner text when it is not valid JSON. */
export const readJsonKey = (state: EditorState, node: SyntaxNode): string => {
  const raw = state.sliceDoc(node.from, node.to);
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === 'string') return parsed;
  } catch {
    // Unfinished escape sequence — fall through to the raw inner text.
  }
  return raw.slice(1, raw.endsWith('"') && raw.length > 1 ? -1 : undefined);
};

/**
 * The `JsonText` node of the region: the whole tree for `json`, the `parseMixed`
 * mount for an `http` body. `null` when the region holds no JSON tree.
 */
export const findJsonText = (state: EditorState, region: JsonRegion): SyntaxNode | null => {
  const tree = ensureSyntaxTree(state, region.to, ENSURE_TREE_TIMEOUT) ?? syntaxTree(state);
  for (let node: SyntaxNode | null = tree.resolveInner(region.from, 1); node; node = node.parent) {
    if (node.name === 'JsonText') return node;
  }
  return null;
};

/** The first complete value child of a node (the root value of `JsonText`, a member's value). */
const firstValueChild = (node: SyntaxNode): SyntaxNode | null => {
  for (let child = node.firstChild; child; child = child.nextSibling) {
    if (isValueNode(child)) return child;
  }
  return null;
};

const collect = (
  state: EditorState,
  value: SyntaxNode,
  pointer: string,
  key: SyntaxNode | null,
  out: Map<string, JsonPointerEntry>,
): void => {
  const entry: JsonPointerEntry = { pointer, valueFrom: value.from, valueTo: value.to };
  if (key) {
    entry.keyFrom = key.from;
    entry.keyTo = key.to;
  }
  // Duplicate keys: the last one wins, like JSON.parse.
  out.set(pointer, entry);

  if (value.name === 'Object') {
    for (const property of value.getChildren('Property')) {
      const name = property.getChild('PropertyName');
      const member = firstValueChild(property);
      if (!name || !member) continue;
      const segment = escapePointerSegment(readJsonKey(state, name));
      collect(state, member, `${pointer}/${segment}`, name, out);
    }
    return;
  }
  if (value.name === 'Array') {
    let index = 0;
    for (let child = value.firstChild; child; child = child.nextSibling) {
      if (!isValueNode(child)) continue;
      collect(state, child, `${pointer}/${index}`, null, out);
      index++;
    }
  }
};

/**
 * RFC 6901 pointer (`''` = root, `/a/0/b`, `~0`/`~1` escaped) → absolute key/value ranges,
 * built from the Lezer JSON tree inside `region`. Unfinished members (no value yet) are skipped.
 */
export const getJsonPointers = (
  state: EditorState,
  region: JsonRegion,
): Map<string, JsonPointerEntry> => {
  const out = new Map<string, JsonPointerEntry>();
  const jsonText = findJsonText(state, region);
  const root = jsonText ? firstValueChild(jsonText) : null;
  if (root) collect(state, root, '', null, out);
  return out;
};

/**
 * Pointer of the innermost key or value that contains `pos` (a key counts as its member).
 * `undefined` outside the JSON value.
 */
export const pointerAt = (
  state: EditorState,
  pos: number,
  region: JsonRegion,
): string | undefined => {
  let best: string | undefined;
  let bestSize = Number.POSITIVE_INFINITY;
  for (const entry of getJsonPointers(state, region).values()) {
    const ranges: [number, number][] = [[entry.valueFrom, entry.valueTo]];
    if (entry.keyFrom !== undefined && entry.keyTo !== undefined) {
      ranges.push([entry.keyFrom, entry.keyTo]);
    }
    for (const [from, to] of ranges) {
      if (pos < from || pos > to || to - from >= bestSize) continue;
      best = entry.pointer;
      bestSize = to - from;
    }
  }
  return best;
};
