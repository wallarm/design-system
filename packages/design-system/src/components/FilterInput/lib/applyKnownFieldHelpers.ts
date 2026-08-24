import type { FieldMetadata, FieldValueOption } from '../types';
import { COUNTRY_OPTIONS } from './country';
import {
  createStatusCodeInputFilter,
  createStatusCodeNormalizer,
  createStatusCodeSerializer,
  createStatusCodeSuggestions,
  createStatusCodeValidator,
} from './statusCode';

type FieldHelpers = Pick<
  FieldMetadata,
  'acceptChar' | 'normalize' | 'getSuggestions' | 'validate' | 'serializeValue' | 'values'
>;

/**
 * Reserved field names whose helper contract is owned by the design system.
 * Keyed by `FieldMetadata.name`; the factories produce the DS-supplied
 * implementation for every slot declared by `FieldHelpers` above.
 */
// Append the bundled ISO list after the consumer-supplied lead, deduped by
// value, so priority countries stay in front and everything else is still
// selectable. An empty lead ⇒ the bundled list unchanged.
const withBundledCountryTail = (lead: FieldValueOption[]): FieldValueOption[] => {
  if (lead.length === 0) return COUNTRY_OPTIONS;
  const seen = new Set(lead.map(option => option.value));
  return [...lead, ...COUNTRY_OPTIONS.filter(option => !seen.has(option.value))];
};

const KNOWN_FIELD_HELPERS: Record<string, (field: FieldMetadata) => FieldHelpers> = {
  status_code: () => ({
    acceptChar: createStatusCodeInputFilter(),
    normalize: createStatusCodeNormalizer(),
    getSuggestions: createStatusCodeSuggestions(),
    validate: createStatusCodeValidator(),
    serializeValue: createStatusCodeSerializer(),
  }),
  // Country options are bundled in DS so the backend doesn't ship the full list.
  // The bundled list gives label resolution (chip + menu) and validation.
  //
  // Consumers may surface priority countries (e.g. a per-client "most seen"
  // list) via `getSuggestions` or `values`; those lead and the bundled list
  // fills the tail (see withBundledCountryTail), so anything not surfaced stays
  // selectable. A plain consumer (no getSuggestions/values) gets the bundled
  // list unchanged, with `getSuggestions` cleared so the allowlist wins (it
  // would otherwise outrank `values` and disable allowlist validation).
  country: field => {
    if (field.getSuggestions) {
      const consumerSuggest = field.getSuggestions;
      return {
        getSuggestions: (input, context) =>
          withBundledCountryTail(consumerSuggest(input, context) ?? []),
        values: COUNTRY_OPTIONS,
      };
    }
    return {
      values: withBundledCountryTail(field.values ?? []),
      getSuggestions: undefined,
    };
  },
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
 * | `country`     | values/getSuggestions (bundled ISO list; consumer lead kept in front) |
 *
 * Backend with a different name (e.g. `http_status_code`) must either rename or
 * wire the pieces manually (`createStatusCode*`, `COUNTRY_OPTIONS`). Only the
 * slots a helper provides are overridden; others keep the consumer's value.
 * Returns the input array by reference when no field matches (stable identity
 * for downstream memos).
 */
export const applyKnownFieldHelpers = (fields: FieldMetadata[]): FieldMetadata[] => {
  let changed = false;
  const out = fields.map(field => {
    const factory = KNOWN_FIELD_HELPERS[field.name];
    if (!factory) return field;
    changed = true;
    return { ...field, ...factory(field) };
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
  KNOWN_FIELD_HELPERS[fieldName]?.({ name: fieldName } as FieldMetadata).serializeValue;
