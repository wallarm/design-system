import type { FC, HTMLAttributes } from 'react';
import { useState } from 'react';
import { cn } from '../../utils/cn';
import { RemoveButton, SegmentAttribute, SegmentOperator, SegmentValue } from './primitives';

export interface FilterChipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  attribute: string;
  operator?: string;
  value?: string;
  error?: boolean;
  onRemove?: () => void;
}

export const FilterChip: FC<FilterChipProps> = ({
  attribute,
  operator,
  value,
  error = false,
  onRemove,
  className,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'relative flex items-center px-4 py-0 cursor-pointer',
        'min-h-[20px] max-w-[560px] border border-solid rounded-8',
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
      <SegmentAttribute className='shrink-0'>{attribute}</SegmentAttribute>
      {operator && <SegmentOperator className='shrink-0'>{operator}</SegmentOperator>}
      {value && <SegmentValue className='min-w-0'>{value}</SegmentValue>}

      {isHovered && onRemove && <RemoveButton error={error} onRemove={onRemove} />}
    </div>
  );
};

FilterChip.displayName = 'FilterChip';
