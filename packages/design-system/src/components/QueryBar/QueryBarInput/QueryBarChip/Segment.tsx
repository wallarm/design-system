import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../../../utils/cn';
import { segmentContainer, segmentTextVariants } from '../classes';

type SegmentVariant = 'attribute' | 'operator' | 'value';

type SegmentProps = HTMLAttributes<HTMLDivElement> & {
  variant: SegmentVariant;
  children: string;
};

export const Segment: FC<SegmentProps> = ({ variant, children, className, ...props }) => (
  <div
    className={cn(segmentContainer, className)}
    data-slot={`segment-${variant}`}
    {...props}
  >
    <p className={segmentTextVariants({ variant })}>{children}</p>
  </div>
);

Segment.displayName = 'Segment';
