import { type FC, useRef } from 'react';
import { useDateSegment } from '@react-aria/datepicker';
import type { DateFieldState, DateSegment } from '@react-stately/datepicker';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { getMonthSegmentText } from './utils';

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
        true: 'cursor-not-allowed opacity-50',
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
}

export const TemporalSegment: FC<TemporalSegmentProps> = ({
  segment,
  state,
  disabled = false,
  readOnly = false,
}) => {
  const ref = useRef<HTMLSpanElement>(null);

  const { segmentProps } = useDateSegment(segment, state, ref);

  const isLiteral = segment.type === 'literal';
  const isEditable = segment.isEditable && !readOnly;

  const segmentTextTrimmed = segment.text.trim();

  if (isLiteral && (segmentTextTrimmed === '/' || segmentTextTrimmed === ',')) {
    return null;
  }

  if (isLiteral) {
    return (
      <span
        className={segmentVariants({
          type: 'literal',
          disabled,
        })}
        aria-hidden='true'
      >
        {segment.text}
      </span>
    );
  }

  // Always show short month names when value is present
  const displayText =
    segment.type === 'month' && segment.value != null && !segment.isPlaceholder
      ? getMonthSegmentText(segment.value, segment.placeholder)
      : segment.text;

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
