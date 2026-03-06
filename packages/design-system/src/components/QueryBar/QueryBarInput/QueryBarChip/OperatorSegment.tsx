import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../../../utils/cn';
import { segmentContainer, segmentTextVariants } from './classes';

type OperatorSegmentProps = HTMLAttributes<HTMLDivElement> & {
  children: string;
};

/** Operator segment — click-only (opens dropdown), no inline editing. */
export const OperatorSegment: FC<OperatorSegmentProps> = ({ children, className, ...props }) => (
  <div className={cn(segmentContainer, className)} data-slot='segment-operator' {...props}>
    <p className={segmentTextVariants({ variant: 'operator' })}>{children}</p>
  </div>
);

OperatorSegment.displayName = 'OperatorSegment';
