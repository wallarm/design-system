import type { Condition, FieldMetadata, QueryBarChipData } from '../../types';
import { getDateDisplayLabel, getOperatorLabel } from '../../lib';

/** Build a display chip for a single condition */
const makeConditionChip = (
  i: number,
  conditions: Condition[],
  fields: FieldMetadata[],
  error: boolean,
): QueryBarChipData => {
  const condition = conditions[i];
  const chipError = condition?.error || error;
  if (!condition) return { id: `chip-${i}`, variant: 'chip', attribute: '', operator: '', value: '', error } as QueryBarChipData;
  const field = fields.find(f => f.name === condition.field);

  let displayValue: string;
  let hasInvalidDate = false;
  if (field?.type === 'date') {
    if (Array.isArray(condition.value)) {
      const parts = condition.value.map(v => getDateDisplayLabel(String(v)));
      hasInvalidDate = parts.some(p => p === 'Invalid Date');
      displayValue = parts.join(' – ');
    } else {
      displayValue = getDateDisplayLabel(String(condition.value ?? ''));
      hasInvalidDate = displayValue === 'Invalid Date';
    }
  } else if (Array.isArray(condition.value)) {
    displayValue = condition.value
      .map(v => field?.values?.find(opt => opt.value === v)?.label ?? String(v))
      .join(', ');
  } else {
    displayValue = String(condition.value ?? '');
    if (field?.values) {
      const opt = field.values.find(o => o.value === condition.value);
      if (opt) displayValue = opt.label;
    }
  }

  return {
    id: `chip-${i}`,
    variant: 'chip',
    attribute: field?.label || condition.field,
    operator: getOperatorLabel(condition.operator, field?.type || 'string'),
    value: displayValue,
    error: chipError || hasInvalidDate,
  };
};

/**
 * Derive display chips from conditions + connectors.
 * When AND and OR are mixed, AND-groups of 2+ conditions get wrapped in parentheses.
 */
export const buildChips = (
  conditions: Condition[],
  connectors: Array<'and' | 'or'>,
  fields: FieldMetadata[],
  error: boolean,
): QueryBarChipData[] => {
  if (conditions.length === 0) return [];

  const hasMixed = connectors.includes('and') && connectors.includes('or');

  if (!hasMixed) {
    return conditions.flatMap((_, i) => {
      const chip = makeConditionChip(i, conditions, fields, error);
      return i > 0
        ? [{ id: `connector-${i}`, variant: connectors[i - 1] ?? 'and', error } as QueryBarChipData, chip]
        : [chip];
    });
  }

  // Mixed AND/OR — split into AND-groups, wrap groups of 2+ in parentheses
  const groups = connectors.reduce<number[][]>(
    (acc, conn, i) => {
      if (conn === 'or') {
        acc.push([i + 1]);
      } else {
        acc.at(-1)?.push(i + 1);
      }
      return acc;
    },
    [[0]],
  );

  return groups.reduce<{ chips: QueryBarChipData[]; parenCounter: number }>(
    (acc, group, g) => {
      if (g > 0) {
        acc.chips.push({ id: `connector-${group[0]!}`, variant: 'or', error });
      }

      const needsParens = group.length > 1;

      if (needsParens) {
        acc.chips.push({ id: `paren-open-${acc.parenCounter}`, variant: '(', error });
      }

      group.forEach((condIdx, j) => {
        if (j > 0) {
          acc.chips.push({ id: `connector-${condIdx}`, variant: 'and', error });
        }
        acc.chips.push(makeConditionChip(condIdx, conditions, fields, error));
      });

      if (needsParens) {
        acc.chips.push({ id: `paren-close-${acc.parenCounter}`, variant: ')', error });
        acc.parenCounter++;
      }

      return acc;
    },
    { chips: [], parenCounter: 0 },
  ).chips;
};
