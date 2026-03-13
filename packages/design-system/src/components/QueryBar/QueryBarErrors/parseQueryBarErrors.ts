import { getFieldValues } from '../lib';
import type { Condition, FieldMetadata } from '../types';
import { isValidFieldValue } from '../hooks/useQueryBarAutocomplete/valueCommitHelpers';

/**
 * Parse conditions into human-readable error messages.
 * Pure function — no React, no side effects.
 */
export const parseQueryBarErrors = (
  conditions: Condition[],
  fields: FieldMetadata[],
): string[] => {
  const errors: string[] = [];

  for (const condition of conditions) {
    if (!condition.error) continue;

    const field = fields.find(f => f.name === condition.field);
    const label = field?.label || condition.field;

    switch (condition.error) {
      case 'attribute':
        errors.push(`Unknown field '${condition.field}'`);
        break;

      case 'value': {
        if (field && Array.isArray(condition.value)) {
          const fv = getFieldValues(field);
          if (fv.length > 0) {
            const invalidValues = condition.value.filter(v => !isValidFieldValue(fv, v));
            if (invalidValues.length > 0) {
              const formatted = invalidValues.map(v => `'${String(v)}'`).join(', ');
              errors.push(`Invalid value for '${label}': ${formatted}`);
              break;
            }
          }
        }
        errors.push(`Invalid value for '${label}'`);
        break;
      }

      default:
        errors.push(`Invalid condition for '${label}'`);
        break;
    }
  }

  return errors;
};
