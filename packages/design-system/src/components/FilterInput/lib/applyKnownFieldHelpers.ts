import type { FieldMetadata } from '../types';
import {
  createStatusCodeInputFilter,
  createStatusCodeNormalizer,
  createStatusCodeSerializer,
  createStatusCodeSuggestions,
  createStatusCodeValidator,
} from './statusCode';

type FieldHelpers = Pick<
  FieldMetadata,
  'acceptChar' | 'normalize' | 'getSuggestions' | 'validate' | 'serializeValue'
>;

/**
 * Reserved field names whose helper contract is owned by the design system.
 * Keyed by `FieldMetadata.name`; the factories produce the DS-supplied
 * implementation for every slot declared by `FieldHelpers` above.
 */
const KNOWN_FIELD_HELPERS: Record<string, () => FieldHelpers> = {
  status_code: () => ({
    acceptChar: createStatusCodeInputFilter(),
    normalize: createStatusCodeNormalizer(),
    getSuggestions: createStatusCodeSuggestions(),
    validate: createStatusCodeValidator(),
    serializeValue: createStatusCodeSerializer(),
  }),
};

/**
 * Decorate `fields` with design-system helpers for reserved names. DS-supplied
 * callbacks **override** consumer values for the same slot — the field
 * semantics (mask range, accepted chars, backend form) are fixed by DS.
 *
 * Reserved names:
 * | `name`        | DS owns                                                  |
 * | ------------- | -------------------------------------------------------- |
 * | `status_code` | acceptChar, normalize, getSuggestions, validate, serializeValue |
 *
 * Backend with a different name (e.g. `http_status_code`) must either rename
 * or wire factories (`createStatusCode*`) manually. Returns the input array
 * by reference when no field matches (stable identity for downstream memos).
 */
export const applyKnownFieldHelpers = (fields: FieldMetadata[]): FieldMetadata[] => {
  let changed = false;
  const out = fields.map(field => {
    const factory = KNOWN_FIELD_HELPERS[field.name];
    if (!factory) return field;
    const helpers = factory();
    changed = true;
    return {
      ...field,
      acceptChar: helpers.acceptChar,
      normalize: helpers.normalize,
      getSuggestions: helpers.getSuggestions,
      validate: helpers.validate,
      serializeValue: helpers.serializeValue,
    };
  });
  return changed ? out : fields;
};

/**
 * Look up the backend-form serializer for a reserved field name; returns
 * undefined for unknown names. For consumers that hold their own expression
 * shape but want the same transform as FilterInput's `serializeValue`.
 */
export const getKnownFieldSerializer = (
  fieldName: string,
): NonNullable<FieldMetadata['serializeValue']> | undefined =>
  KNOWN_FIELD_HELPERS[fieldName]?.().serializeValue;
