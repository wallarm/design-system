import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../../../utils/cn';
import { segmentContainer, segmentTextVariants } from './classes';

interface MultiValueSegmentProps extends HTMLAttributes<HTMLDivElement> {
  valueParts: string[];
  valueSeparator: string;
  errorValueIndices: number[];
}

/** Value segment with per-part error highlighting for multi-value chips. */
export const MultiValueSegment: FC<MultiValueSegmentProps> = ({
  valueParts,
  valueSeparator,
  errorValueIndices,
  className,
  ...props
}) => {
  const isInteractive = !!props.onClick;

  return (
    <div
      className={cn(segmentContainer, className)}
      data-slot='segment-value'
      {...(isInteractive && { role: 'button', 'aria-label': 'Edit filter value' })}
      {...props}
    >
      <p className={segmentTextVariants({ variant: 'value' })}>
        {valueParts.map((part, idx) => (
          <span
            key={idx}
            className={
              errorValueIndices.includes(idx)
                ? segmentTextVariants({ variant: 'value', error: true })
                : undefined
            }
          >
            {part}
            {idx < valueParts.length - 1 && valueSeparator}
          </span>
        ))}
      </p>
    </div>
  );
};

MultiValueSegment.displayName = 'MultiValueSegment';
