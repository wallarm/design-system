import {
  type Completion,
  type CompletionContext,
  type CompletionResult,
  type CompletionSource,
  insertCompletionText,
  pickedCompletion,
} from '@codemirror/autocomplete';
import { ensureSyntaxTree, syntaxTree } from '@codemirror/language';
import type { EditorState } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import type { SyntaxNode } from '@lezer/common';
import type { JsonSchema } from '../../types';
import { escapePointerSegment, getJsonPointers, readJsonKey } from '../languages/jsonPointers';
import {
  getCompiledSchema,
  type LibraryJsonSchema,
  parseJson,
  type SchemaNode,
} from './loadSchema';

interface JsonRegion {
  from: number;
  to: number;
}

/** The text the cursor is in: an (possibly unterminated) string literal, or a bare word. */
interface CursorToken {
  from: number;
  to: number;
  kind: 'string' | 'word';
  closed: boolean;
}

type CompletionTarget =
  | { role: 'key'; container: SyntaxNode }
  | { role: 'value'; container: SyntaxNode; key: string | number };

const WORD_BEFORE = /[\w$.+-]*$/;
const WORD_AFTER = /^[\w$.+-]*/;
const WHITESPACE = /\s/;
const ENSURE_TREE_TIMEOUT = 200;

/** JSON strings cannot span lines, so a scan from the line start tells whether `pos` is inside one. */
const tokenAt = (state: EditorState, pos: number, region: JsonRegion): CursorToken => {
  const line = state.doc.lineAt(pos);
  const start = Math.max(line.from, region.from);
  const end = Math.min(line.to, region.to);
  const before = state.sliceDoc(start, pos);
  const after = state.sliceDoc(pos, end);

  let stringStart = -1;
  for (let i = 0; i < before.length; i++) {
    const ch = before[i];
    if (stringStart < 0) {
      if (ch === '"') stringStart = i;
    } else if (ch === '\\') {
      i++;
    } else if (ch === '"') {
      stringStart = -1;
    }
  }
  if (stringStart >= 0) {
    for (let i = 0; i < after.length; i++) {
      if (after[i] === '\\') {
        i++;
      } else if (after[i] === '"') {
        return { from: start + stringStart, to: pos + i + 1, kind: 'string', closed: true };
      }
    }
    return { from: start + stringStart, to: pos, kind: 'string', closed: false };
  }
  const wordBefore = WORD_BEFORE.exec(before)?.[0] ?? '';
  const wordAfter = WORD_AFTER.exec(after)?.[0] ?? '';
  return { from: pos - wordBefore.length, to: pos + wordAfter.length, kind: 'word', closed: false };
};

/** Nearest non-whitespace character before `pos` (backwards) or from `pos` (forwards). */
const significantChar = (
  state: EditorState,
  pos: number,
  region: JsonRegion,
  direction: -1 | 1,
): { ch: string; pos: number } | null => {
  for (let p = direction < 0 ? pos - 1 : pos; p >= region.from && p < region.to; p += direction) {
    const ch = state.sliceDoc(p, p + 1);
    if (!WHITESPACE.test(ch)) return { ch, pos: p };
  }
  return null;
};

const ancestor = (node: SyntaxNode | null, names: readonly string[]): SyntaxNode | null => {
  for (let current = node; current; current = current.parent) {
    if (names.includes(current.name)) return current;
    if (current.name === 'JsonText') return null;
  }
  return null;
};

const VALUE_NODE_NAMES: readonly string[] = [
  'Object',
  'Array',
  'String',
  'Number',
  'True',
  'False',
  'Null',
];

/** Decides key vs value position from the punctuation before the token and the syntax tree. */
const targetAt = (
  state: EditorState,
  token: CursorToken,
  region: JsonRegion,
): CompletionTarget | null => {
  const previous = significantChar(state, token.from, region, -1);
  if (!previous) return null;
  const tree = ensureSyntaxTree(state, token.to, ENSURE_TREE_TIMEOUT) ?? syntaxTree(state);
  const punctuation = tree.resolveInner(previous.pos + 1, -1);

  if (previous.ch === ':') {
    const property = ancestor(punctuation, ['Property']);
    const name = property?.getChild('PropertyName');
    const container = property?.parent;
    if (!name || !container || container.name !== 'Object') return null;
    return { role: 'value', container, key: readJsonKey(state, name) };
  }
  if (previous.ch !== '{' && previous.ch !== '[' && previous.ch !== ',') return null;
  const container = ancestor(punctuation, ['Object', 'Array']);
  if (!container) return null;
  if (container.name === 'Object') return previous.ch === '[' ? null : { role: 'key', container };
  if (previous.ch === '{') return null;
  let index = 0;
  for (let child = container.firstChild; child; child = child.nextSibling) {
    if (VALUE_NODE_NAMES.includes(child.name) && child.to <= token.from) index++;
  }
  return { role: 'value', container, key: index };
};

/** A completion that also replaces `tail` characters after the cursor (e.g. the closing quote). */
const applyText = (text: string, tail: number): Completion['apply'] =>
  tail === 0
    ? text
    : (view: EditorView, completion: Completion, from: number, to: number) => {
        view.dispatch({
          ...insertCompletionText(view.state, text, from, to + tail),
          annotations: pickedCompletion.of(completion),
        });
      };

const typeLabel = (schema: LibraryJsonSchema): string => {
  const type: unknown = schema.type;
  if (typeof type === 'string') return type;
  if (Array.isArray(type)) return type.filter(item => typeof item === 'string').join(' | ');
  if (Array.isArray(schema.enum)) return 'enum';
  if ('const' in schema) return 'const';
  return '';
};

const hasType = (schema: LibraryJsonSchema, name: string): boolean => {
  const type: unknown = schema.type;
  return type === name || (Array.isArray(type) && type.includes(name));
};

const stringOrUndefined = (value: unknown): string | undefined =>
  typeof value === 'string' && value !== '' ? value : undefined;

const presentKeys = (state: EditorState, object: SyntaxNode, editing: CursorToken): Set<string> => {
  const keys = new Set<string>();
  for (const property of object.getChildren('Property')) {
    const name = property.getChild('PropertyName');
    if (name && name.from !== editing.from) keys.add(readJsonKey(state, name));
  }
  return keys;
};

const propertyOptions = (
  node: SchemaNode,
  present: ReadonlySet<string>,
  render: (name: string) => Completion['apply'],
): Completion[] => {
  const required = new Set(node.required ?? []);
  const options: Completion[] = [];
  for (const [name, child] of Object.entries(node.properties ?? {})) {
    if (present.has(name)) continue;
    const schema = (node.getNodeChild(name).node ?? child).schema;
    const type = typeLabel(schema);
    const isRequired = required.has(name);
    options.push({
      label: name,
      apply: render(name),
      type: 'property',
      detail: isRequired ? (type ? `${type} (required)` : 'required') : type || undefined,
      info: stringOrUndefined(schema.description),
      boost: isRequired ? 1 : 0,
    });
  }
  return options;
};

const valueOptions = (node: SchemaNode, tail: number): Completion[] => {
  const { schema } = node;
  const values: unknown[] = [];
  if (Array.isArray(schema.enum)) values.push(...schema.enum);
  if ('const' in schema) values.push(schema.const);
  if (hasType(schema, 'boolean')) values.push(true, false);
  const seen = new Set<string>();
  const options: Completion[] = [];
  for (const value of values) {
    const text = JSON.stringify(value);
    if (text === undefined || seen.has(text)) continue;
    seen.add(text);
    options.push({
      label: text,
      apply: applyText(text, tail),
      type: 'value',
      info: stringOrUndefined(schema.description),
    });
  }
  return options;
};

/**
 * JSON Schema completions for the JSON region (spec §7.13): missing property names in key
 * position, `enum` / `const` / boolean values in value position. Registered by Task 14.
 */
export const schemaCompletionSource =
  (
    getSchema: () => JsonSchema | undefined,
    getRegion: (state: EditorState) => { from: number; to: number } | null,
  ): CompletionSource =>
  async (context: CompletionContext): Promise<CompletionResult | null> => {
    const schema = getSchema();
    if (schema === undefined) return null;
    const { state, pos } = context;
    const region = getRegion(state);
    if (!region || pos < region.from || pos > region.to) return null;

    const token = tokenAt(state, pos, region);
    if (token.kind === 'word' && token.from === pos && token.to === pos && !context.explicit) {
      return null;
    }
    const target = targetAt(state, token, region);
    if (!target) return null;

    const containerEntry = [...getJsonPointers(state, region).values()].find(
      entry => entry.valueFrom === target.container.from,
    );
    if (!containerEntry) return null;
    const pointer =
      target.role === 'key'
        ? containerEntry.pointer
        : `${containerEntry.pointer}/${escapePointerSegment(String(target.key))}`;

    const parsed = parseJson(state.sliceDoc(region.from, region.to));
    const root = await getCompiledSchema(schema);
    const { node } = root.getNode(pointer, parsed.ok ? parsed.value : undefined);
    if (!node) return null;

    const tail = token.kind === 'string' && !token.closed ? 0 : token.to - pos;
    if (target.role === 'value') {
      const options = valueOptions(node, tail);
      return options.length > 0 ? { from: token.from, options } : null;
    }

    const next = significantChar(state, token.to, region, 1);
    const suffix = next?.ch === ':' ? '' : ': ';
    const inString = token.kind === 'string';
    const options = propertyOptions(node, presentKeys(state, target.container, token), name => {
      const quoted = JSON.stringify(name);
      return applyText(inString ? `${quoted.slice(1)}${suffix}` : `${quoted}${suffix}`, tail);
    });
    if (options.length === 0) return null;
    // Inside a string the filter text starts after the opening quote.
    return { from: inString ? token.from + 1 : token.from, options };
  };
