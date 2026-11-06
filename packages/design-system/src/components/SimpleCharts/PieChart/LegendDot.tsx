import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { legendDotClasses } from './classes';

export interface LegendDotProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
}

export const LegendDot: FC<LegendDotProps> = ({ className, children, ref, ...props }) => {
  const testId = useTestId('legend-dot');

  return (
    <span
      {...props}
      ref={ref}
      data-slot='legend-dot'
      data-testid={testId}
      aria-hidden='true'
      className={cn(legendDotClasses, className)}
    >
      {children ?? '·'}
    </span>
  );
};

LegendDot.displayName = 'LegendDot';
