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
  cn('relative outline-none text-left', 'font-sans text-sm transition-all', 'focus:outline-none'),
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
      // Focus styling is tied to editability: editable segments get the
      // brand blue fill + alt-colour text that make keyboard focus obvious.
      // Literal / read-only segments keep the surrounding text colour (so
      // focus doesn't make the value invisible).
      type: {
        literal:
          'text-text-primary select-none hover:bg-transparent focus:bg-transparent rounded-2',
        editable: 'px-1 focus:bg-bg-fill-brand focus:text-text-primary-alt',
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
  const displayText = displayOverride ?? (isLiteral ? segment.text : resolveSegmentText(segment));

  // Non-interactive rendering: true literals OR readOnly segments.
  // Skip `segmentProps` so react-aria can't make the span focusable/tabbable.
  if (isLiteral || !isEditable) {
    const isReadOnlySegment = !isLiteral && !isEditable && !disabled;
    return (
      <span
        className={cn(
          segmentVariants({
            type: 'literal',
            isPlaceholder: !isLiteral && segment.isPlaceholder,
            disabled,
          }),
          isReadOnlySegment && 'cursor-not-allowed',
        )}
        data-segment={!isLiteral ? segment.type : undefined}
        data-placeholder={!isLiteral && segment.isPlaceholder ? true : undefined}
        aria-hidden='true'
      >
        {displayText}
      </span>
    );
  }

  return (
    <span
      {...segmentProps}
      ref={ref}
      className={cn(
        segmentVariants({
          type: 'editable',
          isPlaceholder: segment.isPlaceholder,
          disabled,
        }),
      )}
      data-segment={segment.type}
      data-placeholder={segment.isPlaceholder || undefined}
    >
      {displayText}
    </span>
  );
};
