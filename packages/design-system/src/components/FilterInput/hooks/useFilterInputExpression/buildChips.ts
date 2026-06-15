import { SEGMENT_VARIANT } from '../../FilterInputField/FilterInputChip';
import {
  findOptionByValue,
  findValueLabelInFields,
  getDateDisplayLabel,
  getInvalidValueIndices,
  getOperatorLabel,
  hasFieldValues,
  isNoValueOperator,
  NO_VALUE_PLACEHOLDER,
} from '../../lib';
import type { ChipErrorSegment, Condition, FieldMetadata, FilterInputChipData } from '../../types';

const INVALID_DATE = 'Invalid Date';
const DATE_RANGE_SEPARATOR = ' – ';
const MULTI_VALUE_SEPARATOR = ', ';
const DEFAULT_FIELD_TYPE = 'string';
const DEFAULT_CONNECTOR = 'and';

const chipId = (i: number) => `chip-${i}`;
const connectorChip = (i: number, variant: 'and' | 'or'): FilterInputChipData =>
  ({ id: `connector-${i}`, variant }) as FilterInputChipData;
const parenChip = (type: 'open' | 'close', counter: number): FilterInputChipData =>
  ({ id: `paren-${type}-${counter}`, variant: type === 'open' ? '(' : ')' }) as FilterInputChipData;

const makeEmptyChip = (i: number, error: boolean): FilterInputChipData =>
  ({
    id: chipId(i),
    variant: 'chip',
    attribute: '',
    operator: '',
    value: '',
    error: error || undefined,
  }) as FilterInputChipData;

/**
 * Resolve a value's display label: prefer the current field's option. Otherwise
 * fall back to any other field that defines this value — after changing a chip's
 * field the value no longer matches the new field, but its human-readable label
 * still lives on the field it came from, so the chip keeps showing the label
 * (e.g. `country = US` → field changed to `attack_type` still reads
 * "United States") instead of the raw value.
 *
 * The cross-field search runs when the chip is errored (`crossField`, the strict
 * AS-1085 path) or the current field offers its own value list. It is skipped
 * for purely freeform fields (no options/values/suggestions) so a hand-typed
 * value that happens to coincide with another field's option is never relabelled.
 */
const resolveValueLabel = (
  value: string | number | boolean | null,
  field: FieldMetadata | undefined,
  fields: FieldMetadata[],
  crossField: boolean,
): string | undefined => {
  const own = findOptionByValue(field, value)?.label;
  if (own !== undefined) return own;
  if (!crossField && !(field && hasFieldValues(field))) return undefined;
  return findValueLabelInFields(value, fields);
};

/** Resolve display value for a single-value condition */
const resolveDisplayValue = (
  condition: Condition,
  field: FieldMetadata | undefined,
  fields: FieldMetadata[],
  crossField: boolean,
): string => {
  const raw = String(condition.value ?? '');
  return (
    resolveValueLabel(
      condition.value as string | number | boolean | null,
      field,
      fields,
      crossField,
    ) ?? raw
  );
};

/** Build base chip data shared by all condition types */
const buildBaseChip = (i: number, condition: Condition, field: FieldMetadata | undefined) => ({
  id: chipId(i),
  variant: 'chip' as const,
  attribute: field?.label || condition.field,
  operator: condition.operator
    ? getOperatorLabel(condition.operator, field?.type || DEFAULT_FIELD_TYPE)
    : undefined,
  ...(condition.disabled && { disabled: true }),
});

/** Build chip for a date range condition (between) */
const buildDateRangeChip = (
  baseChip: ReturnType<typeof buildBaseChip>,
  condition: Condition,
  chipError: ChipErrorSegment | undefined,
): FilterInputChipData => {
  const values = condition.value as Array<string | number | boolean>;
  const parts = values.map(v => getDateDisplayLabel(String(v)));
  const invalidIndices = parts.reduce<number[]>((acc, p, idx) => {
    if (p === INVALID_DATE) acc.push(idx);
    return acc;
  }, []);
  return {
    ...baseChip,
    value: parts.join(DATE_RANGE_SEPARATOR),
    error: chipError || (invalidIndices.length > 0 ? SEGMENT_VARIANT.value : undefined),
    ...(invalidIndices.length > 0 && {
      valueParts: parts,
      valueSeparator: DATE_RANGE_SEPARATOR,
      errorValueIndices: invalidIndices,
    }),
  };
};

/** Build chip for a single date condition */
const buildDateChip = (
  baseChip: ReturnType<typeof buildBaseChip>,
  condition: Condition,
  chipError: ChipErrorSegment | undefined,
): FilterInputChipData => {
  const displayValue = getDateDisplayLabel(String(condition.value ?? ''));
  return {
    ...baseChip,
    value: displayValue,
    error: chipError || (displayValue === INVALID_DATE ? SEGMENT_VARIANT.value : undefined),
  };
};

/** Build chip for a multi-value condition (in, not_in) */
const buildMultiValueChip = (
  baseChip: ReturnType<typeof buildBaseChip>,
  condition: Condition,
  field: FieldMetadata | undefined,
  fields: FieldMetadata[],
  chipError: ChipErrorSegment | undefined,
  crossField: boolean,
): FilterInputChipData => {
  const values = condition.value as Array<string | number | boolean>;
  const valueParts = values.map(v => resolveValueLabel(v, field, fields, crossField) ?? String(v));
  const invalidIndices = field ? getInvalidValueIndices(field, values) : [];
  return {
    ...baseChip,
    value: valueParts.join(MULTI_VALUE_SEPARATOR),
    error: chipError || (invalidIndices.length > 0 ? SEGMENT_VARIANT.value : undefined),
    ...(valueParts.length > 1 && { valueParts }),
    ...(invalidIndices.length > 0 && { errorValueIndices: invalidIndices }),
  };
};

/** Build a display chip for a single condition */
const makeConditionChip = (
  i: number,
  conditions: Condition[],
  fields: FieldMetadata[],
  error: boolean,
): FilterInputChipData => {
  const condition = conditions[i];
  if (!condition) return makeEmptyChip(i, error);

  const chipError: ChipErrorSegment | undefined = condition.error || (error ? true : undefined);
  const field = fields.find(f => f.name === condition.field);
  const baseChip = buildBaseChip(i, condition, field);
  // Only an errored value may borrow its label from another field (see
  // resolveValueLabel) — freeform values stay raw.
  const crossField = chipError === SEGMENT_VARIANT.value || chipError === true;

  // No-value operators (is_null/is_not_null) render a placeholder so the chip
  // still has three segments; type-specific branches below assume a real value.
  if (condition.operator && isNoValueOperator(condition.operator)) {
    return { ...baseChip, value: NO_VALUE_PLACEHOLDER, error: chipError };
  }

  if (field?.type === 'date') {
    return Array.isArray(condition.value)
      ? buildDateRangeChip(baseChip, condition, chipError)
      : buildDateChip(baseChip, condition, chipError);
  }

  if (Array.isArray(condition.value)) {
    return buildMultiValueChip(baseChip, condition, field, fields, chipError, crossField);
  }

  return {
    ...baseChip,
    value: resolveDisplayValue(condition, field, fields, crossField),
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
      return i > 0 ? [connectorChip(i, connectors[i - 1] ?? DEFAULT_CONNECTOR), chip] : [chip];
    });
  }

  // Mixed AND/OR — split into AND-groups, wrap groups of 2+ in parens.
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
        acc.chips.push(connectorChip(group[0]!, 'or'));
      }

      const needsParens = group.length > 1;

      if (needsParens) {
        acc.chips.push(parenChip('open', acc.parenCounter));
      }

      for (const [j, condIdx] of group.entries()) {
        if (j > 0) {
          acc.chips.push(connectorChip(condIdx, 'and'));
        }
        acc.chips.push(makeConditionChip(condIdx, conditions, fields, error));
      }

      if (needsParens) {
        acc.chips.push(parenChip('close', acc.parenCounter));
        acc.parenCounter++;
      }

      return acc;
    },
    { chips: [], parenCounter: 0 },
  ).chips;
};
