import type { FC, HTMLAttributes } from 'react';

import { Text } from '../Text';

export type CheckboxDescriptionProps = Omit<
  HTMLAttributes<HTMLParagraphElement>,
  'className'
>;

export const CheckboxDescription: FC<CheckboxDescriptionProps> = (props) => (
  <Text
    {...props}
    size="sm"
    weight="regular"
    color="secondary"
    data-scope="checkbox"
    data-part="description"
  />
);

CheckboxDescription.displayName = 'CheckboxDescription';
