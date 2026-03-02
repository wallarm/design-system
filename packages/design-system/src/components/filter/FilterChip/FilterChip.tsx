import type { FC, HTMLAttributes } from 'react';
import { useState } from 'react';
import { X } from '../../../icons/X';
import { cn } from '../../../utils/cn';
import { SegmentAttribute } from '../segments/SegmentAttribute';
import { SegmentOperator } from '../segments/SegmentOperator';
import { SegmentValue } from '../segments/SegmentValue';
import type { FilterChipVariant } from '../types';

export interface FilterChipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * The variant of the filter chip
   */
  variant: FilterChipVariant;
  /**
   * The attribute name (for 'chip' variant)
   */
  attribute?: string;
  /**
   * The operator (for 'chip' variant)
   */
  operator?: string;
  /**
   * The value (for 'chip' variant)
   */
  value?: string;
  /**
   * Whether the chip has a validation error
   */
  error?: boolean;
  /**
   * Callback when the remove button is clicked
   */
  onRemove?: () => void;
}

export const FilterChip: FC<FilterChipProps> = ({
  variant,
  attribute,
  operator,
  value,
  error = false,
  onRemove,
  className,
  ...props
}) => {
  // Always call hooks at the top level (even if not used for all variants)
  const [isHovered, setIsHovered] = useState(false);

  // Render AND variant
  if (variant === 'and') {
    return (
      <div
        className={cn(
          // Layout
          'flex items-center justify-center px-2 py-0',
          'min-h-[20px]',
          // Border & Background
          'border border-solid rounded-lg',
          'bg-badge-badge-bg border-border-primary',
          // Typography
          'text-text-secondary text-sm font-normal',
          className,
        )}
        data-slot='filter-chip'
        {...props}
      >
        AND
      </div>
    );
  }

  // Render OR variant
  if (variant === 'or') {
    return (
      <div
        className={cn(
          // Layout
          'flex items-center justify-center px-2 py-0',
          'min-h-[20px]',
          // Border & Background
          'border border-solid rounded-lg',
          'bg-badge-badge-bg border-border-primary',
          // Typography
          'text-text-secondary text-sm font-normal',
          className,
        )}
        data-slot='filter-chip'
        {...props}
      >
        OR
      </div>
    );
  }

  // Render opening parenthesis variant
  if (variant === '(') {
    return (
      <div
        className={cn(
          // Layout
          'flex items-center justify-center px-2 py-0',
          'min-h-[20px]',
          // Border & Background
          'border border-solid rounded-lg',
          'bg-badge-badge-bg border-border-primary',
          // Typography
          'text-text-secondary text-sm font-normal',
          className,
        )}
        data-slot='filter-chip'
        {...props}
      >
        (
      </div>
    );
  }

  // Render closing parenthesis variant
  if (variant === ')') {
    return (
      <div
        className={cn(
          // Layout
          'flex items-center justify-center px-2 py-0',
          'min-h-[20px]',
          // Border & Background
          'border border-solid rounded-lg',
          'bg-badge-badge-bg border-border-primary',
          // Typography
          'text-text-secondary text-sm font-normal',
          className,
        )}
        data-slot='filter-chip'
        {...props}
      >
        )
      </div>
    );
  }

  // Render chip variant
  if (variant === 'chip') {
    return (
      <div
        className={cn(
          // Layout
          'relative flex items-center gap-0 px-1 py-0',
          'min-h-[20px] max-w-[560px]',
          // Border & Background
          'border border-solid rounded-lg',
          error
            ? 'bg-bg-light-danger border-border-danger'
            : 'bg-badge-badge-bg border-border-primary',
          className,
        )}
        data-slot='filter-chip'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Attribute segment */}
        {attribute && <SegmentAttribute className='shrink-0'>{attribute}</SegmentAttribute>}

        {/* Operator segment */}
        {operator && <SegmentOperator className='shrink-0'>{operator}</SegmentOperator>}

        {/* Value segment */}
        {value && <SegmentValue className='shrink-0'>{value}</SegmentValue>}

        {/* Delete button - shown on hover */}
        {isHovered && onRemove && (
          <button
            type='button'
            onClick={e => {
              e.stopPropagation();
              onRemove();
            }}
            className={cn(
              // Position
              'absolute -right-3',
              // Layout
              'flex items-center justify-center',
              'h-full w-[18px]',
              // Border & Background
              'border border-solid',
              'border-l-0 border-border-primary',
              'rounded-r-lg',
              // Hover gradient background
              'bg-gradient-to-r from-[rgba(98,116,142,0.08)] to-[rgba(98,116,142,0.08)]',
              'bg-[rgb(255,255,255)]',
              // Text color
              'text-text-secondary',
            )}
            data-slot='filter-chip-delete'
            aria-label='Remove filter'
          >
            <X className='h-3 w-3' />
          </button>
        )}
      </div>
    );
  }

  // Unknown variant - should not happen with proper TypeScript usage
  return null;
};

FilterChip.displayName = 'FilterChip';
