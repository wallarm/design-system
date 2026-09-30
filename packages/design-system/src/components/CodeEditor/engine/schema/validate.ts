import type { Diagnostic } from '@codemirror/lint';
import type { EditorState } from '@codemirror/state';
import type { JsonSchema } from '../../types';
import { getJsonPointers, type JsonPointerEntry } from '../languages/jsonPointers';
import { getCompiledSchema, type JsonError, parseJson } from './loadSchema';

interface JsonRegion {
  from: number;
  to: number;
}

const REQUIRED_ERROR = 'required-property-error';
const ADDITIONAL_PROPERTY_ERROR = 'no-additional-properties-error';

/** `json-schema-library` reports `#`, `#/a/b` — without RFC 6901 escaping. */
const normalizeLibraryPointer = (pointer: string): string =>
  pointer.startsWith('#') ? pointer.slice(1) : pointer;

const unescapeSegment = (segment: string): string =>
  segment.replaceAll('~1', '/').replaceAll('~0', '~');

/** `/a~1b` → `/a/b`: the (ambiguous) form the library uses in error pointers. */
const toUnescapedPointer = (pointer: string): string =>
  pointer.split('/').map(unescapeSegment).join('/');

const parentPointer = (pointer: string): string | null => {
  const slash = pointer.lastIndexOf('/');
  return slash < 0 ? null : pointer.slice(0, slash);
};

const findEntry = (
  pointers: Map<string, JsonPointerEntry>,
  unescaped: Map<string, JsonPointerEntry>,
  libraryPointer: string,
): JsonPointerEntry | undefined => {
  // Walk up to the nearest ancestor that exists in the document.
  for (
    let pointer: string | null = normalizeLibraryPointer(libraryPointer);
    pointer !== null;
    pointer = parentPointer(pointer)
  ) {
    const entry = pointers.get(pointer) ?? unescaped.get(pointer);
    if (entry) return entry;
  }
  return undefined;
};

const rangeFor = (
  error: JsonError,
  entry: JsonPointerEntry | undefined,
  region: JsonRegion,
): { from: number; to: number } => {
  if (!entry) return { from: region.from, to: Math.min(region.from + 1, region.to) };
  // A missing required property is reported on the object: mark its opening brace.
  if (error.code === REQUIRED_ERROR) return { from: entry.valueFrom, to: entry.valueFrom + 1 };
  // A forbidden property: mark its key.
  if (
    error.code === ADDITIONAL_PROPERTY_ERROR &&
    entry.keyFrom !== undefined &&
    entry.keyTo !== undefined
  ) {
    return { from: entry.keyFrom, to: entry.keyTo };
  }
  if (entry.valueTo > entry.valueFrom) return { from: entry.valueFrom, to: entry.valueTo };
  if (entry.keyFrom !== undefined && entry.keyTo !== undefined) {
    return { from: entry.keyFrom, to: entry.keyTo };
  }
  return { from: region.from, to: Math.min(region.from + 1, region.to) };
};

/**
 * JSON Schema errors for the JSON in `region` (spec §7.13). Returns `[]` when the slice
 * is not valid JSON — syntax errors are reported by the syntax source (Task 12).
 */
export const validateAgainstSchema = async (
  state: EditorState,
  region: JsonRegion,
  schema: JsonSchema,
): Promise<Diagnostic[]> => {
  const parsed = parseJson(state.sliceDoc(region.from, region.to));
  if (!parsed.ok) return [];
  const node = await getCompiledSchema(schema);
  const { errors } = node.validate(parsed.value);
  if (errors.length === 0) return [];

  const pointers = getJsonPointers(state, region);
  const unescaped = new Map<string, JsonPointerEntry>();
  for (const [pointer, entry] of pointers) {
    const key = toUnescapedPointer(pointer);
    if (!unescaped.has(key)) unescaped.set(key, entry);
  }

  return errors.map(error => {
    const { from, to } = rangeFor(
      error,
      findEntry(pointers, unescaped, error.data.pointer),
      region,
    );
    return { from, to, severity: 'error', source: 'schema', message: error.message };
  });
};
