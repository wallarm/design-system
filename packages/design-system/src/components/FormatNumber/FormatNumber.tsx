import type { FC, HTMLAttributes, Ref } from 'react';
import {
  abbreviateNumber,
  formatBytes,
  formatFullNumber,
  formatPercent,
} from '../../utils/abbreviateNumber';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
import { Text } from '../Text';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';

type FormatNumberNotation = 'compact' | 'standard';
type FormatNumberType = 'decimal' | 'percent' | 'byte';

interface FormatNumberBaseProps {
  /** Numeric value to display. null/undefined renders em dash + "No data" tooltip. */
  value: number | null | undefined;

  /**
   * Formatting category. Default: 'decimal'.
   * - 'decimal': plain number with optional abbreviation
   * - 'percent': percentage with boundary safety
   * - 'byte': decimal byte units: 512 B, 2.3 GB
   */
  type?: FormatNumberType;

  /**
   * 'compact' abbreviates (12k, 59.6M); 'standard' shows full value.
   * Default: 'compact'. Only applies to type='decimal' and type='byte'.
   */
  notation?: FormatNumberNotation;

  /**
   * Unit label for accessible name + tooltip: "requests", "errors".
   * Appended after a space. Only meaningful for type='decimal'.
   */
  unit?: string;

  /** Decimal places for percent. Default: 0. */
  decimals?: number;

  ref?: Ref<HTMLSpanElement>;
}

type FormatNumberNativeProps = Omit<HTMLAttributes<HTMLSpanElement>, 'className'>;

export type FormatNumberProps = FormatNumberNativeProps & FormatNumberBaseProps & TestableProps;

const DASHED_UNDERLINE = 'border-b-1 border-dashed border-border-strong-primary';

export const FormatNumber: FC<FormatNumberProps> = ({
  value,
  type = 'decimal',
  notation = 'compact',
  unit,
  decimals = 0,
  ref,
  ...props
}) => {
  // Null / undefined → em dash with "No data" tooltip
  if (value == null) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span ref={ref} data-slot='format-number' {...props}>
            <Text size='sm' color='secondary'>
              —
            </Text>
          </span>
        </TooltipTrigger>
        <TooltipContent>No data</TooltipContent>
      </Tooltip>
    );
  }

  // NaN / Infinity → em dash, no tooltip
  if (!Number.isFinite(value)) {
    return (
      <span ref={ref} data-slot='format-number' {...props}>
        <Text size='sm' color='secondary'>
          —
        </Text>
      </span>
    );
  }

  // Percent
  if (type === 'percent') {
    return (
      <span ref={ref} data-slot='format-number' {...props}>
        <Text size='sm'>{formatPercent(value, decimals)}</Text>
      </span>
    );
  }

  // Byte
  if (type === 'byte') {
    const { display, full } = formatBytes(value);
    const isAbbreviated = notation === 'compact' && value >= 1_000;

    if (isAbbreviated) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span ref={ref} data-slot='format-number' aria-label={full} {...props}>
              <Text size='sm'>
                <span className={cn('whitespace-nowrap tabular-nums', DASHED_UNDERLINE)}>
                  {display}
                </span>
              </Text>
            </span>
          </TooltipTrigger>
          <TooltipContent>{full}</TooltipContent>
        </Tooltip>
      );
    }

    // Standard notation for bytes
    return (
      <span ref={ref} data-slot='format-number' {...props}>
        <Text size='sm'>{full}</Text>
      </span>
    );
  }

  // Decimal
  const abbreviated = abbreviateNumber(value);
  const fullValue = formatFullNumber(value);
  const isAbbreviated = notation === 'compact' && Math.abs(value) >= 1_000;
  const fullWithUnit = unit ? `${fullValue}\u00A0${unit}` : fullValue;

  if (isAbbreviated) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span ref={ref} data-slot='format-number' aria-label={fullWithUnit} {...props}>
            <Text size='sm'>
              <span className={cn('whitespace-nowrap tabular-nums', DASHED_UNDERLINE)}>
                {abbreviated}
              </span>
            </Text>
          </span>
        </TooltipTrigger>
        <TooltipContent>{fullWithUnit}</TooltipContent>
      </Tooltip>
    );
  }

  // Standard or small numbers (no abbreviation)
  const displayValue = unit ? `${fullValue}\u00A0${unit}` : fullValue;

  return (
    <span ref={ref} data-slot='format-number' {...props}>
      <Text size='sm'>{displayValue}</Text>
    </span>
  );
};

FormatNumber.displayName = 'FormatNumber';
