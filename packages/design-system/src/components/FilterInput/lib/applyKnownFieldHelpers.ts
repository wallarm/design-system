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
// Section headers for the merged country menu: the consumer lead groups under
// the first, the remaining bundled countries under the second.
const FREQUENT_COUNTRY_SECTION = 'Most frequent';
const OTHER_COUNTRY_SECTION = 'Other countries';

// Merge the consumer-supplied lead with the bundled ISO list, split into two
// labeled sections (`section` sugar → headers in the value menu): the lead
// under "Most frequent", the remaining bundled countries (deduped against the
// lead by value) under "Other countries". An empty lead ⇒ the flat bundled
// list unchanged (no headers — there is nothing to distinguish).
const withBundledCountrySections = (lead: FieldValueOption[]): FieldValueOption[] => {
  if (lead.length === 0) return COUNTRY_OPTIONS;
  const seen = new Set(lead.map(option => option.value));
  return [
    ...lead.map(option => ({ ...option, section: FREQUENT_COUNTRY_SECTION })),
    ...COUNTRY_OPTIONS.filter(option => !seen.has(option.value)).map(option => ({
      ...option,
      section: OTHER_COUNTRY_SECTION,
    })),
  ];
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
  // list) via `getSuggestions` or `values`; those group under a "Most frequent"
  // header and the remaining bundled countries under "Other countries" (see
  // withBundledCountrySections), so anything not surfaced stays selectable. A
  // plain consumer (no getSuggestions/values) gets the flat bundled list
  // unchanged, with `getSuggestions` cleared so the allowlist wins (it would
  // otherwise outrank `values` and disable allowlist validation).
  country: field => {
    if (field.getSuggestions) {
      // Keeping a `getSuggestions` on the field means the DS allowlist
      // validation no longer runs for it (getSuggestions is treated as a
      // hint, not an allowlist): a code outside the list commits without a
      // red chip. That is intentional here — a consumer opting into a dynamic
      // list owns its own validity (the AS-1419 attacks filter is
      // backend-validated, strictValues:false). `values` stays the bundled
      // list, not the merged one, so committed-chip labels resolve from it;
      // fine as long as the lead relabels bundled codes with their canonical
      // ISO names (setting the merged list would force the lazy fetch eagerly).
      const consumerSuggest = field.getSuggestions;
      return {
        getSuggestions: (input, context) =>
          withBundledCountrySections(consumerSuggest(input, context) ?? []),
        values: COUNTRY_OPTIONS,
      };
    }
    return {
      values: withBundledCountrySections(field.values ?? []),
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
 * | `country`     | values/getSuggestions (consumer lead → "Most frequent" section, bundled ISO list → "Other countries") |
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
