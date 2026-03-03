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

  // Helper function for rendering operator/parenthesis variants
  const renderOperatorChip = (content: string) => {
    return (
      <div
        className={cn(
          // Layout
          'relative flex items-center justify-center px-1 py-0 cursor-pointer',
          'min-h-[20px] max-w-[320px]',
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
        {/* Text content with proper structure */}
        <div className='flex flex-col justify-center leading-none overflow-hidden text-ellipsis whitespace-nowrap p-0.5'>
          <p
            className={cn(
              'text-sm font-normal leading-5 overflow-hidden text-ellipsis',
              error ? 'text-text-danger' : 'text-text-secondary',
            )}
          >
            {content}
          </p>
        </div>

        {/* Delete button - shown on hover */}
        {isHovered && onRemove && (
          <button
            type='button'
            onClick={e => {
              e.stopPropagation();
              onRemove();
            }}
            className={cn(
              // Position — extend 1px above and below chip border
              'absolute -right-3 top-[-1px] bottom-[-1px]',
              // Layout — reset button padding
              'flex items-center justify-center p-0 cursor-pointer',
              'w-[18px]',
              // Border & Background
              'border border-solid',
              'border-l-0',
              error ? 'border-border-danger' : 'border-border-primary',
              'rounded-r-lg',
              error ? 'bg-bg-light-danger' : 'bg-badge-badge-bg',
              // Text color
              error ? 'text-text-danger' : 'text-text-secondary',
            )}
            data-slot='filter-chip-delete'
            aria-label='Remove filter'
          >
            <X className='h-3 w-3' />
          </button>
        )}
      </div>
    );
  };

  // Render AND variant
  if (variant === 'and') {
    return renderOperatorChip('AND');
  }

  // Render OR variant
  if (variant === 'or') {
    return renderOperatorChip('OR');
  }

  // Render opening parenthesis variant
  if (variant === '(') {
    return renderOperatorChip('(');
  }

  // Render closing parenthesis variant
  if (variant === ')') {
    return renderOperatorChip(')');
  }

  // Render chip variant
  if (variant === 'chip') {
    return (
      <div
        className={cn(
          // Layout
          'relative flex items-center gap-0 px-1 py-0 cursor-pointer',
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
              // Position — extend 1px above and below chip border
              'absolute -right-3 top-[-1px] bottom-[-1px]',
              // Layout — reset button padding
              'flex items-center justify-center p-0 cursor-pointer',
              'w-[18px]',
              // Border & Background — match Figma exactly
              'border border-solid',
              'border-l-0',
              error ? 'border-border-danger' : 'border-border-primary',
              'rounded-r-lg',
              error ? 'bg-bg-light-danger' : 'bg-badge-badge-bg',
              // Text color
              error ? 'text-text-danger' : 'text-text-secondary',
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
