import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { Text } from '../../Text';

export interface ChartTitleProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
}

export const ChartTitle: FC<ChartTitleProps> = ({ className, ref, ...props }) => {
  const testId = useTestId('title');

  return (
    <Text asChild size='xs' weight='medium' color='primary' truncate>
      <span
        {...props}
        ref={ref}
        data-slot='chart-title'
        data-testid={testId}
        className={cn('min-w-0 flex-1', className)}
      />
    </Text>
  );
};

ChartTitle.displayName = 'ChartTitle';
