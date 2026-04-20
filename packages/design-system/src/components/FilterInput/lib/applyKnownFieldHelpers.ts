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
 * Known field names that auto-wire DS helpers. Keyed by `FieldMetadata.name`
 * — when a field with this name is passed to `FilterInput` without explicit
 * helpers, the factories below fill in `acceptChar` / `normalize` /
 * `getSuggestions` / `validate`. Consumer-supplied callbacks always win.
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
 * Reserved names and what they auto-attach (unless the consumer already
 * provided a value for that slot):
 *
 * | `name`        | Attaches                                                             |
 * | ------------- | -------------------------------------------------------------------- |
 * | `status_code` | HTTP status code: `acceptChar`, `normalize`, `getSuggestions`, `validate` |
 *
 * Consumer-supplied callbacks always win over the auto-wired ones. If the
 * backend uses a different name (e.g. `http_status_code`), the helpers are
 * NOT applied — the consumer must either rename the field to match or wire
 * the factories (`createStatusCode*`) manually.
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
      acceptChar: field.acceptChar ?? helpers.acceptChar,
      normalize: field.normalize ?? helpers.normalize,
      getSuggestions: field.getSuggestions ?? helpers.getSuggestions,
      validate: field.validate ?? helpers.validate,
      serializeValue: field.serializeValue ?? helpers.serializeValue,
    };
  });
  return changed ? out : fields;
};
