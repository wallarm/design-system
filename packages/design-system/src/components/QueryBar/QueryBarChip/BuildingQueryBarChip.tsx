import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';
import { SegmentAttribute } from './SegmentAttribute';
import { SegmentOperator } from './SegmentOperator';
import { SegmentValue } from './SegmentValue';

export interface BuildingQueryBarChipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  attribute: string;
  operator?: string;
  value?: string;
}

export const BuildingQueryBarChip: FC<BuildingQueryBarChipProps> = ({
  attribute,
  operator,
  value,
  className,
  ...props
}) => (
  <div
    className={cn(
      'relative flex items-center px-4 py-0',
      'min-h-[20px] max-w-[560px] border border-solid rounded-8',
      'bg-badge-badge-bg border-border-primary',
      className,
    )}
    data-slot='query-bar-chip'
    {...props}
  >
    <SegmentAttribute className='shrink-0'>{attribute}</SegmentAttribute>
    {operator && <SegmentOperator className='shrink-0'>{operator}</SegmentOperator>}
    {value && <SegmentValue className='min-w-0'>{value}</SegmentValue>}
  </div>
);

BuildingQueryBarChip.displayName = 'BuildingQueryBarChip';
