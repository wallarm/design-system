import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { NumericBadge, type NumericBadgeProps } from '../NumericBadge';

export interface TimelineIndicatorProps
  extends Omit<NumericBadgeProps, 'type' | 'size' | 'data-slot'> {}

export const TimelineIndicator: FC<TimelineIndicatorProps> = props => {
  const testId = useTestId('indicator');

  return (
    <NumericBadge {...props} type='outline' data-slot='timeline-indicator' data-testid={testId} />
  );
};

TimelineIndicator.displayName = 'TimelineIndicator';
