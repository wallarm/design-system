import { type FC, useRef } from 'react';
import { useDateSegment } from '@react-aria/datepicker';
import type { DateFieldState, DateSegment } from '@react-stately/datepicker';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { getMonthSegmentText } from './utils';

function resolveSegmentText(segment: DateSegment): string {
  if (segment.type === 'month' && segment.value != null && !segment.isPlaceholder) {
    return getMonthSegmentText(segment.value, segment.placeholder);
  }
  if (segment.type === 'dayPeriod') {
    return segment.text.toUpperCase();
  }
  return segment.text;
}

const segmentVariants = cva(
  cn(
    'relative outline-none text-left',
    'font-sans text-sm transition-all',
    'focus:bg-bg-fill-brand focus:text-text-primary-alt',
    'focus:outline-none',
  ),
  {
    variants: {
      isPlaceholder: {
        true: 'text-text-secondary',
        false: 'text-text-primary',
      },
      disabled: {
        true: 'cursor-not-allowed',
        false: 'hover:bg-states-primary-default-alt cursor-text',
      },
      type: {
        literal: 'text-text-primary select-none hover:bg-transparent focus:bg-transparent',
        editable: 'px-1',
      },
    },
    defaultVariants: {
      type: 'editable',
      isPlaceholder: false,
      disabled: false,
    },
  },
);

interface TemporalSegmentProps {
  segment: DateSegment;
  state: DateFieldState;
  disabled?: boolean;
  readOnly?: boolean;
  /** Override the displayed text (from TemporalSegmentGroup normalization). */
  displayOverride?: string;
}

export const TemporalSegment: FC<TemporalSegmentProps> = ({
  segment,
  state,
  disabled = false,
  readOnly = false,
  displayOverride,
}) => {
  const ref = useRef<HTMLSpanElement>(null);

  const { segmentProps } = useDateSegment(segment, state, ref);

  const isLiteral = segment.type === 'literal';
  const isEditable = segment.isEditable && !readOnly;

  if (isLiteral) {
    return (
      <span
        className={segmentVariants({
          type: 'literal',
          disabled,
        })}
        aria-hidden='true'
      >
        {displayOverride ?? segment.text}
      </span>
    );
  }

  const displayText = displayOverride ?? resolveSegmentText(segment);

  return (
    <span
      {...segmentProps}
      ref={ref}
      className={segmentVariants({
        type: isEditable ? 'editable' : 'literal',
        isPlaceholder: segment.isPlaceholder,
        disabled: disabled || !isEditable,
      })}
      data-segment={segment.type}
      data-placeholder={segment.isPlaceholder || undefined}
    >
      {displayText}
    </span>
  );
};
