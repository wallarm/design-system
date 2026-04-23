import { forwardRef, type ReactNode } from 'react';
import type { DateFieldState, DateSegment, TimeFieldState } from '@react-stately/datepicker';
import type { GroupDOMAttributes } from '@react-types/shared';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { type DateOrder, useDateFormat } from '../DateFormatProvider';
import { TemporalSegment } from './TemporalSegment';

export interface TemporalSegmentGroupProps extends GroupDOMAttributes {
  state: DateFieldState | TimeFieldState;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  segmentKeyPrefix?: string;
}

const literalVariants = cva(
  'relative outline-none text-left font-sans text-sm text-text-primary select-none',
  {
    variants: {
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: '',
      },
    },
    defaultVariants: { disabled: false },
  },
);

/**
 * Render a static literal separator (not backed by a react-aria segment).
 */
const Literal = ({ text, disabled }: { text: string; disabled?: boolean }) => (
  <span className={literalVariants({ disabled })} aria-hidden='true'>
    {text}
  </span>
);

/**
 * Build the normalized segment list.
 *
 * Order follows `DateFormatProvider` (default `day-first`):
 *   - `day-first`  → day → " " → month → ", " → year → time
 *   - `month-first`→ month → " " → day → ", " → year → time
 *
 * Year always trails the two order-sensitive segments, separated by ", ".
 * Time segments (hour, minute, second, dayPeriod + their ":" literals) are
 * appended after a space, preserving react-aria's internal literal order.
 * Time-only inputs (no date parts) render segments as-is.
 */
function buildParts(
  segments: DateSegment[],
  state: DateFieldState | TimeFieldState,
  order: DateOrder,
  disabled?: boolean,
  readOnly?: boolean,
  keyPrefix = '',
): ReactNode[] {
  const day = segments.find(s => s.type === 'day');
  const month = segments.find(s => s.type === 'month');
  const year = segments.find(s => s.type === 'year');

  const hasDateParts = !!(day || month || year);

  // Time-only input → render original segments as-is
  if (!hasDateParts) {
    return segments.map((seg, i) => (
      <TemporalSegment
        key={`${keyPrefix}${seg.type}_${i}`}
        segment={seg}
        state={state}
        disabled={disabled}
        readOnly={readOnly}
      />
    ));
  }

  const hourIdx = segments.findIndex(s => s.type === 'hour');
  const timeSegments = hourIdx >= 0 ? segments.slice(hourIdx) : [];

  const parts: ReactNode[] = [];

  // Day rendering strips leading zero ("01" → "1"); react-aria keeps it
  // because `shouldForceLeadingZeros: true` is set on the state.
  const renderDay = (dayKey: string) => {
    if (!day) return;
    const dayOverride =
      !day.isPlaceholder && day.text.length === 2 && day.text[0] === '0'
        ? day.text.slice(1)
        : undefined;
    parts.push(
      <TemporalSegment
        key={dayKey}
        segment={day}
        state={state}
        disabled={disabled}
        readOnly={readOnly}
        displayOverride={dayOverride}
      />,
    );
  };

  const renderMonth = (monthKey: string) => {
    if (!month) return;
    parts.push(
      <TemporalSegment
        key={monthKey}
        segment={month}
        state={state}
        disabled={disabled}
        readOnly={readOnly}
      />,
    );
  };

  if (order === 'month-first') {
    renderMonth(`${keyPrefix}month`);
    if (month && day) {
      parts.push(<Literal key={`${keyPrefix}sep-md`} text=' ' disabled={disabled} />);
    }
    renderDay(`${keyPrefix}day`);
  } else {
    renderDay(`${keyPrefix}day`);
    if (day && month) {
      parts.push(<Literal key={`${keyPrefix}sep-dm`} text=' ' disabled={disabled} />);
    }
    renderMonth(`${keyPrefix}month`);
  }

  // ", " + Year (same in both orders)
  if (year) {
    parts.push(<Literal key={`${keyPrefix}sep-my`} text=', ' disabled={disabled} />);
    parts.push(
      <TemporalSegment
        key={`${keyPrefix}year`}
        segment={year}
        state={state}
        disabled={disabled}
        readOnly={readOnly}
      />,
    );
  }

  // " " + Time segments (hour ":" minute ":" second " " dayPeriod)
  if (timeSegments.length > 0) {
    parts.push(<Literal key={`${keyPrefix}sep-dt`} text=' ' disabled={disabled} />);
    timeSegments.forEach((seg, i) =>
      parts.push(
        <TemporalSegment
          key={`${keyPrefix}time_${seg.type}_${i}`}
          segment={seg}
          state={state}
          disabled={disabled}
          readOnly={readOnly}
        />,
      ),
    );
  }

  return parts;
}

export const TemporalSegmentGroup = forwardRef<HTMLDivElement, TemporalSegmentGroupProps>(
  ({ state, disabled, readOnly, className, segmentKeyPrefix = '', ...props }, ref) => {
    const { order } = useDateFormat();
    const parts = buildParts(state.segments, state, order, disabled, readOnly, segmentKeyPrefix);

    return (
      <div {...props} ref={ref} className={cn('flex items-center gap-0.5', className)}>
        {parts}
      </div>
    );
  },
);

TemporalSegmentGroup.displayName = 'TemporalSegmentGroup';
