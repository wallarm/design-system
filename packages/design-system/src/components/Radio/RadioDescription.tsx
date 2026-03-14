import type { FC, HTMLAttributes } from 'react';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';

export type RadioDescriptionProps = Omit<HTMLAttributes<HTMLParagraphElement>, 'className'>;

export const RadioDescription: FC<RadioDescriptionProps> = props => {
  const testId = useTestId('description');

  return (
    <Text
      {...props}
      data-testid={testId}
      size='sm'
      weight='regular'
      color='secondary'
      data-scope='radio'
      data-part='description'
    />
  );
};

RadioDescription.displayName = 'RadioDescription';
