import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';

type SegmentOperatorProps = HTMLAttributes<HTMLDivElement> & {
  children: string;
};

export const SegmentOperator: FC<SegmentOperatorProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center p-0.5',
        'text-sm font-normal text-text-secondary leading-5',
        'overflow-hidden text-ellipsis whitespace-nowrap',
        className,
      )}
      data-slot='segment-operator'
      {...props}
    >
      {children}
    </div>
  );
};

SegmentOperator.displayName = 'SegmentOperator';
