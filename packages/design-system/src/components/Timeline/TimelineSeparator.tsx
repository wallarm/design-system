import type { FC } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Separator, type SeparatorProps } from '../Separator';
import { timelineSeparatorVariants } from './classes';

export interface TimelineSeparatorProps extends Omit<SeparatorProps, 'orientation'> {}

export const TimelineSeparator: FC<TimelineSeparatorProps> = ({ className, ...props }) => {
  const testId = useTestId('separator');

  return (
    <Separator
      {...props}
      orientation='vertical'
      data-slot='timeline-separator'
      data-testid={testId}
      className={cn(timelineSeparatorVariants(), className)}
    />
  );
};

TimelineSeparator.displayName = 'TimelineSeparator';
