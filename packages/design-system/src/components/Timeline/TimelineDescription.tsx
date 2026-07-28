import type { FC, ReactNode } from 'react';
import { useTestId } from '../../utils/testId';
import { Text, type TextProps } from '../Text';

export interface TimelineDescriptionProps extends Omit<TextProps, 'size' | 'weight' | 'color'> {
  children: ReactNode;
}

export const TimelineDescription: FC<TimelineDescriptionProps> = ({ children, ...props }) => {
  const testId = useTestId('description');

  return (
    <Text {...props} data-slot='timeline-description' data-testid={testId} size='sm' color='secondary'>
      {children}
    </Text>
  );
};

TimelineDescription.displayName = 'TimelineDescription';
