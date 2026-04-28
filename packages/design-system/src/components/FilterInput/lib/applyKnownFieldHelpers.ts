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
 * Decorate `fields` in place with design-system helpers for known field names.
 * `FilterInput` calls this on the `fields` prop before rendering.
 *
 * Reserved names and what the design system owns:
 *
 * | `name`        | DS owns                                                                                    |
 * | ------------- | ------------------------------------------------------------------------------------------ |
 * | `status_code` | HTTP status code: `acceptChar`, `normalize`, `getSuggestions`, `validate`, `serializeValue` |
 *
 * For reserved names, DS-supplied callbacks **override** any consumer-supplied
 * value for the same slot. This is intentional: the field semantics (mask
 * range `1XX..5XX`, accepted characters, backend form) are fixed by the
 * design system. Consumer-supplied `options`/`getSuggestions` would otherwise
 * fight the canonical mask UX.
 *
 * If the backend uses a different name (e.g. `http_status_code`), the helpers
 * are NOT applied — the consumer must either rename the field to match or
 * wire the factories (`createStatusCode*`) manually.
 *
 * The returned array has **reference-stable identity** when no field matches,
 * so downstream `useMemo` that depends on it does not invalidate unnecessarily.
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
 * Look up the backend-form serializer for a reserved field name. Returns
 * `undefined` for unknown names. Useful for consumers that hold their own
 * expression shape (not DS `ExprNode`) but need to apply the same backend
 * transform that the FilterInput's `serializeValue` slot would produce — so
 * they can drive the lookup off the field name without hard-coding which
 * names are reserved.
 */
export const getKnownFieldSerializer = (
  fieldName: string,
): NonNullable<FieldMetadata['serializeValue']> | undefined =>
  KNOWN_FIELD_HELPERS[fieldName]?.().serializeValue;
