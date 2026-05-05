import type { FC, HTMLAttributes } from 'react';
import { Zap } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { segmentVariants } from './classes';

interface ParameterPathSegmentProps extends HTMLAttributes<HTMLSpanElement> {
  children: string;
  variant?: 'default' | 'highlighted';
  /** Show the Zap icon — only honored when `variant='highlighted'`. */
  withZap?: boolean;
  /** Segment index in the path; used to derive a `segment-N` test id. */
  index?: number;
}

export const ParameterPathSegment: FC<ParameterPathSegmentProps> = ({
  children,
  variant = 'default',
  withZap = false,
  index,
  className,
  ...rest
}) => {
  const testId = useTestId(index !== undefined ? `segment-${index}` : 'segment');
  return (
    <span
      {...rest}
      data-slot='parameter-path-segment'
      data-variant={variant}
      data-testid={testId}
      className={cn(segmentVariants({ variant }), className)}
    >
      {children}
      {withZap && variant === 'highlighted' ? (
        <Zap size='sm' className='text-icon-danger' aria-hidden='true' />
      ) : null}
    </span>
  );
};

ParameterPathSegment.displayName = 'ParameterPathSegment';
