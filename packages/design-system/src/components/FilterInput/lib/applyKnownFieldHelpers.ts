import type { FieldMetadata } from '../types';
import {
  createStatusCodeInputFilter,
  createStatusCodeNormalizer,
  createStatusCodeSuggestions,
  createStatusCodeValidator,
} from './statusCode';

type FieldHelpers = Pick<FieldMetadata, 'acceptChar' | 'normalize' | 'getSuggestions' | 'validate'>;

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
  }),
};

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
    };
  });
  return changed ? out : fields;
};
