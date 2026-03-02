import type { FC, HTMLAttributes } from 'react';
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
  // Only render chip variant for now (US-004)
  if (variant !== 'chip') {
    return null;
  }

  return (
    <div
      className={cn(
        // Layout
        'flex items-center gap-0 px-1 py-0',
        'min-h-[20px] max-w-[320px]',
        // Border & Background
        'border border-solid rounded-lg',
        error ? 'bg-bg-light-danger border-border-danger' : 'bg-badge-badge-bg border-border-primary',
        className,
      )}
      data-slot='filter-chip'
      {...props}
    >
      {/* Attribute segment */}
      {attribute && <SegmentAttribute className='shrink-0'>{attribute}</SegmentAttribute>}

      {/* Operator segment */}
      {operator && <SegmentOperator className='shrink-0'>{operator}</SegmentOperator>}

      {/* Value segment */}
      {value && <SegmentValue className='shrink-0'>{value}</SegmentValue>}
    </div>
  );
};

FilterChip.displayName = 'FilterChip';
