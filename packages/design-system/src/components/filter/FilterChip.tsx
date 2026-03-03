import type { FC, HTMLAttributes } from 'react';
import { useState } from 'react';
import { cn } from '../../utils/cn';
import { VARIANT_LABELS } from './lib/constants';
import { RemoveButton, SegmentAttribute, SegmentOperator, SegmentValue } from './primitives';
import type { FilterChipVariant } from './types';

export interface FilterChipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  variant: FilterChipVariant;
  attribute?: string;
  operator?: string;
  value?: string;
  error?: boolean;
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
  const [isHovered, setIsHovered] = useState(false);

  const isChip = variant === 'chip';
  const label = VARIANT_LABELS[variant];

  return (
    <div
      className={cn(
        'relative flex items-center px-4 py-0 cursor-pointer',
        'min-h-[20px] border border-solid rounded-8',
        isChip ? 'max-w-[560px]' : 'max-w-[320px] justify-center',
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
      {isChip ? (
        <>
          {attribute && <SegmentAttribute className='shrink-0'>{attribute}</SegmentAttribute>}
          {operator && <SegmentOperator className='shrink-0'>{operator}</SegmentOperator>}
          {value && <SegmentValue className='min-w-0'>{value}</SegmentValue>}
        </>
      ) : (
        <div className='flex flex-col justify-center leading-none overflow-hidden p-2'>
          <p className={cn('text-sm font-normal truncate', error ? 'text-text-danger' : 'text-text-secondary')}>
            {label}
          </p>
        </div>
      )}

      {isHovered && onRemove && <RemoveButton error={error} onRemove={onRemove} />}
    </div>
  );
};

FilterChip.displayName = 'FilterChip';
