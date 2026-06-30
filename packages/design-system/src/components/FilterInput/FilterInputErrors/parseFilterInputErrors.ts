import { SEGMENT_VARIANT } from '../FilterInputField/FilterInputChip';
import { getFieldValues, hasStaticAllowlist, isNoValueOperator, isValidFieldValue } from '../lib';
import type { Condition, FieldMetadata } from '../types';

/** True when a paired field's required second value is absent or empty. */
const isPairValueMissing = (condition: Condition): boolean => {
  const pair = condition.pair;
  if (!pair) return true;
  if (pair.operator && isNoValueOperator(pair.operator)) return false;
  const value = pair.value;
  return value == null || value === '' || (Array.isArray(value) && value.length === 0);
};

/**
 * Parse conditions into human-readable error messages.
 * Pure function — no React, no side effects.
 */
export const parseFilterInputErrors = (
  conditions: Condition[],
  fields: FieldMetadata[],
): string[] => {
  const errors: string[] = [];

  for (const condition of conditions) {
    const field = fields.find(f => f.name === condition.field);

    // Paired (two-step) field: the second value is required — unless the base
    // operator takes no value (e.g. "is not set"), in which case the chip is a
    // single-value filter and no paired triplet is built.
    const baseIsNoValue = condition.operator != null && isNoValueOperator(condition.operator);
    if (field?.pairedField && !baseIsNoValue && isPairValueMissing(condition)) {
      errors.push(`${field.pairedField.label} is required`);
    }

    const label = field?.label || condition.field;

    // A known non-paired field left incomplete (no operator, or a value-bearing
    // operator with no value) reads red in the chip — so it must also surface a
    // banner message: a red chip and an error message always exist together
    // (AS-1179). Paired fields are covered by the pair check above; conditions
    // carrying an explicit `error` flag fall through to the switch below.
    if (field && !field.pairedField && !condition.error) {
      const operatorMissing = !condition.operator;
      const valueMissing =
        !baseIsNoValue &&
        !operatorMissing &&
        (condition.value == null ||
          condition.value === '' ||
          (Array.isArray(condition.value) && condition.value.length === 0));
      if (operatorMissing || valueMissing) {
        errors.push(`${label} is incomplete`);
        continue;
      }
    }

    if (!condition.error) continue;

    switch (condition.error) {
      case SEGMENT_VARIANT.attribute:
        errors.push(`Unknown field ${condition.field}`);
        break;

      case SEGMENT_VARIANT.value: {
        if (field?.validate) {
          const values = Array.isArray(condition.value) ? condition.value : [condition.value];
          const invalidValues = values.filter(
            (v): v is string | number | boolean => v != null && field.validate!(v),
          );
          if (invalidValues.length > 0) {
            const formatted = invalidValues.map(v => String(v)).join(', ');
            errors.push(`Invalid value for ${label}: ${formatted}`);
            break;
          }
        }
        if (field && hasStaticAllowlist(field) && Array.isArray(condition.value)) {
          const fv = getFieldValues(field);
          if (fv.length > 0) {
            const invalidValues = condition.value.filter(v => !isValidFieldValue(fv, v));
            if (invalidValues.length > 0) {
              const formatted = invalidValues.map(v => String(v)).join(', ');
              errors.push(`Invalid value for ${label}: ${formatted}`);
              break;
            }
          }
        }
        errors.push(`Invalid value for ${label}`);
        break;
      }

      default:
        errors.push(`Invalid condition for ${label}`);
        break;
    }
  }

  return errors;
};
