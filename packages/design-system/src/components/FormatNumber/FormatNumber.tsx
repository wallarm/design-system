import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
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

  /**
   * Whether to show a tooltip with the full value on abbreviated numbers.
   * When false, abbreviated values display without tooltip or dashed underline.
   * Default: true.
   */
  tooltip?: boolean;

  /**
   * 'default' renders the value as 14px regular body text. 'inherit' renders a plain span so
   * font, size, weight and colour come from the parent (e.g. a heading or button).
   * Default: 'default'.
   */
  typography?: 'default' | 'inherit';

  ref?: Ref<HTMLSpanElement>;
}

type FormatNumberNativeProps = Omit<HTMLAttributes<HTMLSpanElement>, 'className'>;

export type FormatNumberProps = FormatNumberNativeProps & FormatNumberBaseProps & TestableProps;

const DASHED_UNDERLINE = 'border-b-1 border-dashed border-border-strong-primary';

const TOOLTIP_POSITIONING = { placement: 'top' as const };

interface InnerProps {
  inherit: boolean;
  secondary?: boolean;
  children: ReactNode;
}

const Inner: FC<InnerProps> = ({ inherit, secondary, children }) => {
  if (inherit)
    return <span className={secondary ? 'text-text-secondary' : undefined}>{children}</span>;
  return (
    <Text size='sm' color={secondary ? 'secondary' : undefined}>
      {children}
    </Text>
  );
};

export const FormatNumber: FC<FormatNumberProps> = ({
  value,
  type = 'decimal',
  notation = 'compact',
  unit,
  decimals = 0,
  tooltip: showTooltip = true,
  typography = 'default',
  ref,
  ...props
}) => {
  const inherit = typography === 'inherit';

  // Null / undefined → em dash with "No data" tooltip
  if (value == null) {
    return (
      <Tooltip positioning={TOOLTIP_POSITIONING}>
        <TooltipTrigger asChild>
          <span ref={ref} className='w-fit' data-slot='format-number' {...props}>
            <Inner inherit={inherit} secondary>
              —
            </Inner>
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
        <Inner inherit={inherit} secondary>
          —
        </Inner>
      </span>
    );
  }

  // Percent
  if (type === 'percent') {
    return (
      <span ref={ref} data-slot='format-number' {...props}>
        <Inner inherit={inherit}>{formatPercent(value, decimals)}</Inner>
      </span>
    );
  }

  // Byte
  if (type === 'byte') {
    const { display, full } = formatBytes(value);
    const isAbbreviated = notation === 'compact' && value >= 1_000;

    if (isAbbreviated && showTooltip) {
      return (
        <Tooltip positioning={TOOLTIP_POSITIONING}>
          <TooltipTrigger asChild>
            <span
              ref={ref}
              className='w-fit'
              data-slot='format-number'
              aria-label={full}
              {...props}
            >
              <Inner inherit={inherit}>
                <span className={cn('whitespace-nowrap tabular-nums', DASHED_UNDERLINE)}>
                  {display}
                </span>
              </Inner>
            </span>
          </TooltipTrigger>
          <TooltipContent>{full}</TooltipContent>
        </Tooltip>
      );
    }

    if (isAbbreviated) {
      return (
        <span ref={ref} data-slot='format-number' aria-label={full} {...props}>
          <Inner inherit={inherit}>
            <span className='whitespace-nowrap tabular-nums'>{display}</span>
          </Inner>
        </span>
      );
    }

    // Standard notation for bytes
    return (
      <span ref={ref} data-slot='format-number' {...props}>
        <Inner inherit={inherit}>{full}</Inner>
      </span>
    );
  }

  // Decimal
  const abbreviated = abbreviateNumber(value);
  const fullValue = formatFullNumber(value);
  const isAbbreviated = notation === 'compact' && Math.abs(value) >= 1_000;
  const fullWithUnit = unit ? `${fullValue}\u00A0${unit}` : fullValue;

  if (isAbbreviated && showTooltip) {
    return (
      <Tooltip positioning={TOOLTIP_POSITIONING}>
        <TooltipTrigger asChild>
          <span
            ref={ref}
            className='w-fit'
            data-slot='format-number'
            aria-label={fullWithUnit}
            {...props}
          >
            <Inner inherit={inherit}>
              <span className={cn('whitespace-nowrap tabular-nums', DASHED_UNDERLINE)}>
                {abbreviated}
              </span>
            </Inner>
          </span>
        </TooltipTrigger>
        <TooltipContent>{fullWithUnit}</TooltipContent>
      </Tooltip>
    );
  }

  if (isAbbreviated) {
    const displayValue = unit ? `${abbreviated}\u00A0${unit}` : abbreviated;

    return (
      <span ref={ref} data-slot='format-number' aria-label={fullWithUnit} {...props}>
        <Inner inherit={inherit}>
          <span className='whitespace-nowrap tabular-nums'>{displayValue}</span>
        </Inner>
      </span>
    );
  }

  // Standard or small numbers (no abbreviation)
  const displayValue = unit ? `${fullValue}\u00A0${unit}` : fullValue;

  return (
    <span ref={ref} data-slot='format-number' {...props}>
      <Inner inherit={inherit}>{displayValue}</Inner>
    </span>
  );
};

FormatNumber.displayName = 'FormatNumber';
