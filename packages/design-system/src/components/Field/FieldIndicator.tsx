import type { FC } from 'react';
import { useFieldContext } from '@ark-ui/react/field';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';

export const FieldIndicator: FC = () => {
  const { required } = useFieldContext();
  const testId = useTestId('indicator');

  return (
    <Text size='sm' color={required ? 'danger' : 'secondary'} data-testid={testId}>
      {required ? '*' : '(Optional)'}
    </Text>
  );
};
