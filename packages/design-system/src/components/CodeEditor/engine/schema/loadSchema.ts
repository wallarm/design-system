import type { SchemaNode } from 'json-schema-library';
import type { JsonSchema } from '../../types';

/** Library types for the other schema modules, so this file stays the single import site. */
export type {
  JsonError,
  JsonSchema as LibraryJsonSchema,
  SchemaNode,
} from 'json-schema-library';

type SchemaLibrary = typeof import('json-schema-library');

let libraryPromise: Promise<SchemaLibrary> | null = null;

/**
 * The only place `json-schema-library` is imported (spec D8): a separate chunk that
 * loads on first use. The promise is cached; a failed load is retried on the next call.
 */
export const loadSchemaLibrary = (): Promise<SchemaLibrary> => {
  libraryPromise ??= import('json-schema-library').catch((error: unknown) => {
    libraryPromise = null;
    throw error;
  });
  return libraryPromise;
};

/** Compiled nodes per schema object identity (a new object → a recompile). */
const compiledObjects = new WeakMap<object, SchemaNode>();
const compiledBooleans = new Map<boolean, SchemaNode>();

/** `compileSchema(schema)` from the lazily loaded library, cached per schema identity. */
export const getCompiledSchema = async (schema: JsonSchema): Promise<SchemaNode> => {
  const cached =
    typeof schema === 'boolean' ? compiledBooleans.get(schema) : compiledObjects.get(schema);
  if (cached) return cached;
  const { compileSchema } = await loadSchemaLibrary();
  const node = compileSchema(schema);
  if (typeof schema === 'boolean') compiledBooleans.set(schema, node);
  else compiledObjects.set(schema, node);
  return node;
};

/** `JSON.parse` without throwing: `{ ok: false }` for invalid JSON. */
export const parseJson = (text: string): { ok: true; value: unknown } | { ok: false } => {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
};
