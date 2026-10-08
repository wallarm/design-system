import type { FC, ReactNode } from 'react';
import type { TestableProps } from '../../utils/testId';
import { useTestId } from '../../utils/testId';
import { Text, type TextProps } from '../Text';

export interface OverflowListMoreHeaderProps
  extends Omit<TextProps, 'size' | 'weight' | 'color'>,
    TestableProps {
  children: ReactNode;
}

export const OverflowListMoreHeader: FC<OverflowListMoreHeaderProps> = ({
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('header', testIdProp);

  return (
    <Text
      {...props}
      size='sm'
      weight='medium'
      color='secondary'
      data-slot='overflow-list-more-header'
      data-testid={testId}
    />
  );
};

OverflowListMoreHeader.displayName = 'OverflowListMoreHeader';
