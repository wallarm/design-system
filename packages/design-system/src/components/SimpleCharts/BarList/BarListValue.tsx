import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { barListValueClasses } from './classes';

export interface BarListValueProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
}

export const BarListValue: FC<BarListValueProps> = ({ className, ref, ...props }) => {
  const testId = useTestId('value');

  return (
    <span
      {...props}
      ref={ref}
      data-slot='bar-list-value'
      data-testid={testId}
      className={cn(barListValueClasses, className)}
    />
  );
};

BarListValue.displayName = 'BarListValue';
