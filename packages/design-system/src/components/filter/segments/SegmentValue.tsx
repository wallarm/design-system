import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';

type SegmentValueProps = HTMLAttributes<HTMLDivElement> & {
  children: string;
};

export const SegmentValue: FC<SegmentValueProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'flex flex-col justify-center p-0.5',
        'leading-none',
        'overflow-hidden text-ellipsis whitespace-nowrap',
        className,
      )}
      data-slot='segment-value'
      {...props}
    >
      <p className='text-sm font-medium text-text-info leading-5 overflow-hidden text-ellipsis'>
        {children}
      </p>
    </div>
  );
};

SegmentValue.displayName = 'SegmentValue';
