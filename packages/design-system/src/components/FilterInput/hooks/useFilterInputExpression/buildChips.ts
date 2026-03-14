import { getDateDisplayLabel, getOperatorLabel } from '../../lib';
import type { ChipErrorSegment, Condition, FieldMetadata, FilterInputChipData } from '../../types';
import { getInvalidValueIndices } from '../useFilterInputAutocomplete/valueCommitHelpers';

/** Build a display chip for a single condition */
const makeConditionChip = (
  i: number,
  conditions: Condition[],
  fields: FieldMetadata[],
  error: boolean,
): FilterInputChipData => {
  const condition = conditions[i];
  const chipError: ChipErrorSegment | undefined = condition?.error || (error ? true : undefined);
  if (!condition)
    return {
      id: `chip-${i}`,
      variant: 'chip',
      attribute: '',
      operator: '',
      value: '',
      error: error || undefined,
    } as FilterInputChipData;
  const field = fields.find(f => f.name === condition.field);

  const baseChip = {
    id: `chip-${i}`,
    variant: 'chip' as const,
    attribute: field?.label || condition.field,
    operator: getOperatorLabel(condition.operator, field?.type || 'string'),
  };

  // Date fields
  if (field?.type === 'date') {
    if (Array.isArray(condition.value)) {
      const parts = condition.value.map(v => getDateDisplayLabel(String(v)));
      const invalidIndices = parts.reduce<number[]>((acc, p, idx) => {
        if (p === 'Invalid Date') acc.push(idx);
        return acc;
      }, []);
      return {
        ...baseChip,
        value: parts.join(' – '),
        error: chipError || (invalidIndices.length > 0 ? 'value' : undefined),
        ...(invalidIndices.length > 0 && {
          valueParts: parts,
          valueSeparator: ' – ',
          errorValueIndices: invalidIndices,
        }),
      };
    }
    const displayValue = getDateDisplayLabel(String(condition.value ?? ''));
    return {
      ...baseChip,
      value: displayValue,
      error: chipError || (displayValue === 'Invalid Date' ? 'value' : undefined),
    };
  }

  // Multi-value (in, not_in)
  if (Array.isArray(condition.value)) {
    const valueParts = condition.value.map(
      v => field?.values?.find(opt => opt.value === v)?.label ?? String(v),
    );
    const invalidIndices = field ? getInvalidValueIndices(field, condition.value) : [];
    return {
      ...baseChip,
      value: valueParts.join(', '),
      error: chipError || (invalidIndices.length > 0 ? 'value' : undefined),
      ...(valueParts.length > 1 && { valueParts }),
      ...(invalidIndices.length > 0 && { errorValueIndices: invalidIndices }),
    };
  }

  // Single value
  let displayValue = String(condition.value ?? '');
  if (field?.values) {
    const opt = field.values.find(o => o.value === condition.value);
    if (opt) displayValue = opt.label;
  }

  return {
    ...baseChip,
    value: displayValue,
    error: chipError,
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
): FilterInputChipData[] => {
  if (conditions.length === 0) return [];

  const hasMixed = connectors.includes('and') && connectors.includes('or');

  if (!hasMixed) {
    return conditions.flatMap((_, i) => {
      const chip = makeConditionChip(i, conditions, fields, error);
      return i > 0
        ? [
            { id: `connector-${i}`, variant: connectors[i - 1] ?? 'and' } as FilterInputChipData,
            chip,
          ]
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

  return groups.reduce<{ chips: FilterInputChipData[]; parenCounter: number }>(
    (acc, group, g) => {
      if (g > 0) {
        acc.chips.push({ id: `connector-${group[0]!}`, variant: 'or' });
      }

      const needsParens = group.length > 1;

      if (needsParens) {
        acc.chips.push({ id: `paren-open-${acc.parenCounter}`, variant: '(' });
      }

      group.forEach((condIdx, j) => {
        if (j > 0) {
          acc.chips.push({ id: `connector-${condIdx}`, variant: 'and' });
        }
        acc.chips.push(makeConditionChip(condIdx, conditions, fields, error));
      });

      if (needsParens) {
        acc.chips.push({ id: `paren-close-${acc.parenCounter}`, variant: ')' });
        acc.parenCounter++;
      }

      return acc;
    },
    { chips: [], parenCounter: 0 },
  ).chips;
};
