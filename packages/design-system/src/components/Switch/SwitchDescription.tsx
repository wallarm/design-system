import type { FC, HTMLAttributes } from 'react';
import { Text } from '../Text';

export type SwitchDescriptionProps = Omit<HTMLAttributes<HTMLParagraphElement>, 'className'>;

export const SwitchDescription: FC<SwitchDescriptionProps> = props => (
  <Text
    {...props}
    size='md'
    weight='regular'
    color='secondary'
    data-scope='switch'
    data-part='description'
  />
);

SwitchDescription.displayName = 'SwitchDescription';
