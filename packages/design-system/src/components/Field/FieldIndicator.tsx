import type { FC } from 'react';
import { useFieldContext } from '@ark-ui/react/field';
import { Text } from '../Text';

export const FieldIndicator: FC = () => {
  const { required } = useFieldContext();

  return (
    <Text size='sm' color={required ? 'danger' : 'secondary'}>
      {required ? '*' : '(Optional)'}
    </Text>
  );
};
