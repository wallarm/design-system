import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';

type SegmentValueProps = HTMLAttributes<HTMLDivElement> & {
  children: string;
};

export const SegmentValue: FC<SegmentValueProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center p-2',
        'text-sm font-medium text-text-info',
        'overflow-hidden text-ellipsis whitespace-nowrap',
        className,
      )}
      data-slot='segment-value'
      {...props}
    >
      {children}
    </div>
  );
};

SegmentValue.displayName = 'SegmentValue';
