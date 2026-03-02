import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';

type SegmentAttributeProps = HTMLAttributes<HTMLDivElement> & {
  children: string;
};

export const SegmentAttribute: FC<SegmentAttributeProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center p-0.5',
        'text-sm font-normal text-text-primary leading-5',
        'overflow-hidden text-ellipsis whitespace-nowrap',
        className,
      )}
      data-slot='segment-attribute'
      {...props}
    >
      {children}
    </div>
  );
};

SegmentAttribute.displayName = 'SegmentAttribute';
