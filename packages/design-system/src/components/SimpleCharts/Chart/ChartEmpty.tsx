import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { Text } from '../../Text';
import { chartEmptyClasses } from './classes';

export interface ChartEmptyProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export const ChartEmpty: FC<ChartEmptyProps> = ({ className, children, ref, ...props }) => {
  const testId = useTestId('empty');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='chart-empty'
      data-testid={testId}
      className={cn(chartEmptyClasses, className)}
    >
      <Text size='xs' color='secondary'>
        {children ?? 'No data'}
      </Text>
    </div>
  );
};

ChartEmpty.displayName = 'ChartEmpty';
