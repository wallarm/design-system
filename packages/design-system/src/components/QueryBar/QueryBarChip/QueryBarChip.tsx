import type { FC, HTMLAttributes } from 'react';
import { useState } from 'react';
import { cn } from '../../../utils/cn';
import { QueryBarRemoveButton } from './QueryBarRemoveButton';
import { SegmentAttribute } from './SegmentAttribute';
import { SegmentOperator } from './SegmentOperator';
import { SegmentValue } from './SegmentValue';

export interface QueryBarChipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  attribute: string;
  operator?: string;
  value?: string;
  error?: boolean;
  onRemove?: () => void;
}

export const QueryBarChip: FC<QueryBarChipProps> = ({
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
      data-slot='query-bar-chip'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <SegmentAttribute className='shrink-0'>{attribute}</SegmentAttribute>
      {operator && <SegmentOperator className='shrink-0'>{operator}</SegmentOperator>}
      {value && <SegmentValue className='min-w-0'>{value}</SegmentValue>}

      {isHovered && onRemove && <QueryBarRemoveButton error={error} onRemove={onRemove} />}
    </div>
  );
};

QueryBarChip.displayName = 'QueryBarChip';
