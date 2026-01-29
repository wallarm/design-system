import type { FC } from 'react';

import { Separator, type SeparatorProps } from '../Separator';

type FieldSeparatorProps = SeparatorProps;

export const FieldSeparator: FC<FieldSeparatorProps> = (props) => (
  <Separator {...props} />
);

FieldSeparator.displayName = 'FieldSeparator';
