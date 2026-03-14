import type { FC, HTMLAttributes } from 'react';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';

export type SwitchDescriptionProps = Omit<HTMLAttributes<HTMLParagraphElement>, 'className'>;

export const SwitchDescription: FC<SwitchDescriptionProps> = props => {
  const testId = useTestId('description');

  return (
    <Text
      {...props}
      data-testid={testId}
      size='md'
      weight='regular'
      color='secondary'
      data-scope='switch'
      data-part='description'
    />
  );
};

SwitchDescription.displayName = 'SwitchDescription';
