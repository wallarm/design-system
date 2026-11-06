import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { Separator, type SeparatorProps } from '../Separator';

type FieldSeparatorProps = SeparatorProps;

export const FieldSeparator: FC<FieldSeparatorProps> = props => {
  const testId = useTestId('separator');

  return <Separator data-testid={testId} {...props} />;
};

FieldSeparator.displayName = 'FieldSeparator';
