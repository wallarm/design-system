import type { FC, HTMLAttributes } from 'react';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';

export type CheckboxDescriptionProps = Omit<HTMLAttributes<HTMLParagraphElement>, 'className'>;

export const CheckboxDescription: FC<CheckboxDescriptionProps> = props => {
  const testId = useTestId('description');

  return (
    <Text
      data-testid={testId}
      {...props}
      size='sm'
      weight='regular'
      color='secondary'
      data-scope='checkbox'
      data-part='description'
    />
  );
};

CheckboxDescription.displayName = 'CheckboxDescription';
