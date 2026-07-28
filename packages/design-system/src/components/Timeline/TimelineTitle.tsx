import type { FC, ReactNode } from 'react';
import { useTestId } from '../../utils/testId';
import { Text, type TextProps } from '../Text';

export interface TimelineTitleProps extends Omit<TextProps, 'size' | 'weight' | 'color'> {
  children: ReactNode;
}

export const TimelineTitle: FC<TimelineTitleProps> = ({ children, ...props }) => {
  const testId = useTestId('title');

  return (
    <Text
      {...props}
      data-slot='timeline-title'
      data-testid={testId}
      size='sm'
      weight='medium'
      color='primary'
    >
      {children}
    </Text>
  );
};

TimelineTitle.displayName = 'TimelineTitle';
