import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';

type SegmentOperatorProps = HTMLAttributes<HTMLDivElement> & {
  children: string;
};

export const SegmentOperator: FC<SegmentOperatorProps> = ({ children, className, ...props }) => (
  <div
    className={cn(
      'flex flex-col justify-center p-2',
      'leading-none',
      ' text-ellipsis whitespace-nowrap',
      className,
    )}
    data-slot='segment-operator'
    {...props}
  >
    <p className='text-sm font-normal text-text-secondary  text-ellipsis'>
      {children}
    </p>
  </div>
);

SegmentOperator.displayName = 'SegmentOperator';
