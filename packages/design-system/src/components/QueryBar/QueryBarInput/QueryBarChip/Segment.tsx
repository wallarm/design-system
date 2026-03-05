import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../../../utils/cn';

type SegmentVariant = 'attribute' | 'operator' | 'value';

const textStyles: Record<SegmentVariant, string> = {
  attribute: 'font-normal text-text-primary',
  operator: 'font-normal text-text-secondary',
  value: 'font-medium text-text-info',
};

type SegmentProps = HTMLAttributes<HTMLDivElement> & {
  variant: SegmentVariant;
  children: string;
};

export const Segment: FC<SegmentProps> = ({ variant, children, className, ...props }) => (
  <div
    className={cn('flex flex-col justify-center overflow-hidden p-2 leading-none', className)}
    data-slot={`segment-${variant}`}
    {...props}
  >
    <p className={cn('truncate text-sm', textStyles[variant])}>{children}</p>
  </div>
);

Segment.displayName = 'Segment';
