import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const CheckboxIndeterminate: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <rect x='3.5' y='10.5' width='17' height='3' rx='0.75' fill='currentColor' />
  </SvgIcon>
);

CheckboxIndeterminate.displayName = 'CheckboxIndeterminateIcon';
