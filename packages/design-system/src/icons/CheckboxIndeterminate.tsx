import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const CheckboxIndeterminate: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M19 10.5C19.8284 10.5 20.5 11.1716 20.5 12C20.5 12.8284 19.8284 13.5 19 13.5H5C4.17157 13.5 3.5 12.8284 3.5 12C3.5 11.1716 4.17157 10.5 5 10.5H19Z'
      fill='currentColor'
    />
  </SvgIcon>
);

CheckboxIndeterminate.displayName = 'CheckboxIndeterminateIcon';
