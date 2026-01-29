import type { FC, HTMLAttributes } from 'react';

import { Text } from '../Text';

export type RadioDescriptionProps = Omit<
  HTMLAttributes<HTMLParagraphElement>,
  'className'
>;

export const RadioDescription: FC<RadioDescriptionProps> = (props) => (
  <Text
    {...props}
    size="sm"
    weight="regular"
    color="secondary"
    data-scope="radio"
    data-part="description"
  />
);

RadioDescription.displayName = 'RadioDescription';
