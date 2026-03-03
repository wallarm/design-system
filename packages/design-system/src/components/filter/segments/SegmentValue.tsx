import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';

type SegmentValueProps = HTMLAttributes<HTMLDivElement> & {
  children: string;
};

export const SegmentValue: FC<SegmentValueProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'flex flex-col justify-center p-2',
        'leading-none',
        ' text-ellipsis whitespace-nowrap',
        className,
      )}
      data-slot='segment-value'
      {...props}
    >
      <p className='text-sm font-medium text-text-info  text-ellipsis'>
        {children}
      </p>
    </div>
  );
};

SegmentValue.displayName = 'SegmentValue';
