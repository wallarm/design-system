import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { barListLabelClasses } from './classes';

export interface BarListLabelProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
}

export const BarListLabel: FC<BarListLabelProps> = ({ className, ref, ...props }) => {
  const testId = useTestId('label');

  return (
    <span
      {...props}
      ref={ref}
      data-slot='bar-list-label'
      data-testid={testId}
      className={cn(barListLabelClasses, className)}
    />
  );
};

BarListLabel.displayName = 'BarListLabel';
