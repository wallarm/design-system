import type { FC, FocusEvent, HTMLAttributes, KeyboardEvent } from 'react';
import { cn } from '../../../../utils/cn';
import { segmentContainer, segmentTextVariants } from './classes';
import { Segment } from './Segment';

interface ValueSegmentProps extends HTMLAttributes<HTMLDivElement> {
  children: string;
  error?: boolean;
  /** Individual display parts for multi-value chips */
  valueParts?: string[];
  /** Separator between parts (default: ", ") */
  valueSeparator?: string;
  /** Indices of invalid values in valueParts */
  errorValueIndices?: number[];
  editing?: boolean;
  editText?: string;
  onEditChange?: (text: string) => void;
  onEditKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onEditBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}

export const ValueSegment: FC<ValueSegmentProps> = ({
  children,
  error,
  valueParts,
  valueSeparator = ', ',
  errorValueIndices,
  editing,
  editText,
  onEditChange,
  onEditKeyDown,
  onEditBlur,
  className,
  ...domProps
}) => {
  // Multi-value with per-value errors while NOT editing: render each part separately.
  // When editing, fall through to Segment so the <input> appears for dropdown filtering.
  if (valueParts && errorValueIndices && errorValueIndices.length > 0 && !editing) {
    const isInteractive = !!domProps.onClick;
    return (
      <div
        className={cn(segmentContainer, className)}
        data-slot='segment-value'
        {...(isInteractive && { role: 'button', 'aria-label': 'Edit filter value' })}
        {...domProps}
      >
        <p className={segmentTextVariants({ variant: 'value' })}>
          {valueParts.map((part, idx) => (
            <span
              key={idx}
              className={
                errorValueIndices.includes(idx)
                  ? segmentTextVariants({ variant: 'value', error: true })
                  : undefined
              }
            >
              {part}
              {idx < valueParts.length - 1 && valueSeparator}
            </span>
          ))}
        </p>
      </div>
    );
  }

  // Single value, editing, or no per-value errors: delegate to base Segment
  return (
    <Segment
      variant='value'
      error={error}
      editing={editing}
      editText={editText}
      onEditChange={onEditChange}
      onEditKeyDown={onEditKeyDown}
      onEditBlur={onEditBlur}
      className={className}
      {...domProps}
    >
      {children}
    </Segment>
  );
};

ValueSegment.displayName = 'ValueSegment';
