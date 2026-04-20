import type { FieldMetadata, FieldPreset } from '../types';
import {
  createStatusCodeInputFilter,
  createStatusCodeNormalizer,
  createStatusCodeSuggestions,
  createStatusCodeValidator,
} from './statusCode';

type PresetHelpers = Pick<
  FieldMetadata,
  'acceptChar' | 'normalize' | 'getSuggestions' | 'validate'
>;

const PRESET_HELPERS: Record<FieldPreset, () => PresetHelpers> = {
  status_code: () => ({
    acceptChar: createStatusCodeInputFilter(),
    normalize: createStatusCodeNormalizer(),
    getSuggestions: createStatusCodeSuggestions(),
    validate: createStatusCodeValidator(),
  }),
};

/**
 * Resolve `FieldMetadata.preset` into concrete helpers. Consumer-supplied
 * callbacks (`acceptChar` / `normalize` / `getSuggestions` / `validate`)
 * always win over the preset so individual fields can still override parts
 * of a preset when needed.
 */
export const applyFieldPresets = (fields: FieldMetadata[]): FieldMetadata[] => {
  let changed = false;
  const out = fields.map(field => {
    if (!field.preset) return field;
    const helpers = PRESET_HELPERS[field.preset]?.();
    if (!helpers) return field;
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
