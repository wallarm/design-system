import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';

type SegmentAttributeProps = HTMLAttributes<HTMLDivElement> & {
  children: string;
};

export const SegmentAttribute: FC<SegmentAttributeProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'flex flex-col justify-center p-2',
        'leading-none',
        ' text-ellipsis whitespace-nowrap',
        className,
      )}
      data-slot='segment-attribute'
      {...props}
    >
      <p className='text-sm font-normal text-text-primary  text-ellipsis'>
        {children}
      </p>
    </div>
  );
};

SegmentAttribute.displayName = 'SegmentAttribute';
