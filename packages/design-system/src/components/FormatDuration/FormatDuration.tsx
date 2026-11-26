import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type DurationValue, describeDuration, toDurationMs } from '../../utils/formatDuration';
import type { TestableProps } from '../../utils/testId';
import { Text } from '../Text';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';

interface FormatDurationBaseProps {
  /**
   * Milliseconds, or an ISO 8601 duration ("PT2M13S"). null/undefined renders an em dash
   * with a "No data" tooltip; a negative or unparsable value renders a bare em dash.
   */
  value: DurationValue;

  /**
   * Whether to show the exact duration in a tooltip when smaller units were dropped
   * ("1h 4m" → "1h 4m 30s"). Default: true.
   */
  tooltip?: boolean;

  /**
   * 'default' renders 14px body text; 'inherit' takes font, size and colour from the parent.
   * Default: 'default'.
   */
  typography?: 'default' | 'inherit';

  ref?: Ref<HTMLTimeElement>;
}

type FormatDurationNativeProps = Omit<HTMLAttributes<HTMLTimeElement>, 'className'>;

export type FormatDurationProps = FormatDurationNativeProps &
  FormatDurationBaseProps &
  TestableProps;

const DASHED_UNDERLINE = 'border-b-1 border-dashed border-border-strong-primary';

const TOOLTIP_POSITIONING = { placement: 'top' as const };

const Inner: FC<{ inherit: boolean; secondary?: boolean; children: ReactNode }> = ({
  inherit,
  secondary,
  children,
}) =>
  inherit ? (
    <span className={secondary ? 'text-text-secondary' : undefined}>{children}</span>
  ) : (
    <Text size='sm' color={secondary ? 'secondary' : undefined}>
      {children}
    </Text>
  );

export const FormatDuration: FC<FormatDurationProps> = ({
  value,
  tooltip: showTooltip = true,
  typography = 'default',
  ref,
  ...props
}) => {
  const inherit = typography === 'inherit';

  if (value == null) {
    return (
      <Tooltip positioning={TOOLTIP_POSITIONING}>
        <TooltipTrigger asChild>
          <time ref={ref} className='w-fit' data-slot='format-duration' {...props}>
            <Inner inherit={inherit} secondary>
              —
            </Inner>
          </time>
        </TooltipTrigger>
        <TooltipContent>No data</TooltipContent>
      </Tooltip>
    );
  }

  const ms = toDurationMs(value);

  if (ms == null) {
    return (
      <time ref={ref} data-slot='format-duration' {...props}>
        <Inner inherit={inherit} secondary>
          —
        </Inner>
      </time>
    );
  }

  const { display, full, iso } = describeDuration(ms);
  const truncated = showTooltip && full !== display;

  const node = (
    <time ref={ref} dateTime={iso} className='w-fit' data-slot='format-duration' {...props}>
      <Inner inherit={inherit}>
        <span className={cn('whitespace-nowrap tabular-nums', truncated && DASHED_UNDERLINE)}>
          {display}
        </span>
      </Inner>
    </time>
  );

  if (!truncated) return node;

  return (
    <Tooltip positioning={TOOLTIP_POSITIONING}>
      <TooltipTrigger asChild>{node}</TooltipTrigger>
      <TooltipContent>{full}</TooltipContent>
    </Tooltip>
  );
};

FormatDuration.displayName = 'FormatDuration';
