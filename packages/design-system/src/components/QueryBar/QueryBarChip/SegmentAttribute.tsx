import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';

type SegmentAttributeProps = HTMLAttributes<HTMLDivElement> & {
  children: string;
};

export const SegmentAttribute: FC<SegmentAttributeProps> = ({ children, className, ...props }) => (
  <div
    className={cn(
      'flex flex-col justify-center p-2 overflow-hidden',
      'leading-none',
      className,
    )}
    data-slot='segment-attribute'
    {...props}
  >
    <p className='text-sm font-normal text-text-primary truncate'>
      {children}
    </p>
  </div>
);

SegmentAttribute.displayName = 'SegmentAttribute';
