import type { FC, HTMLAttributes } from 'react';
import { useState } from 'react';
import { cn } from '../../../utils/cn';
import { chipVariants } from './classes';
import { QueryBarRemoveButton } from './QueryBarRemoveButton';
import { Segment } from './Segment';

export interface QueryBarChipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  attribute: string;
  operator?: string;
  value?: string;
  error?: boolean;
  building?: boolean;
  onRemove?: () => void;
}

export const QueryBarChip: FC<QueryBarChipProps> = ({
  attribute,
  operator,
  value,
  error = false,
  building = false,
  onRemove,
  className,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const interactive = !building;

  return (
    <div
      className={cn(chipVariants({ error, interactive }), 'max-w-[600px]', className)}
      data-slot='query-bar-chip'
      onMouseEnter={interactive ? () => setIsHovered(true) : undefined}
      onMouseLeave={interactive ? () => setIsHovered(false) : undefined}
      {...props}
    >
      <Segment variant='attribute' className='shrink-0'>{attribute}</Segment>
      {operator && <Segment variant='operator' className='shrink-0'>{operator}</Segment>}
      {value && <Segment variant='value' className='min-w-0 max-w-[400px]'>{value}</Segment>}

      {isHovered && onRemove && <QueryBarRemoveButton error={error} onRemove={onRemove} />}
    </div>
  );
};

QueryBarChip.displayName = 'QueryBarChip';
