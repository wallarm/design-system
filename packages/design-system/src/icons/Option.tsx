import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Option: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M9 2C9.43033 2 9.81204 2.27541 9.94824 2.68359L15.7207 20H21C21.5523 20 22 20.4477 22 21C22 21.5523 21.5523 22 21 22H15C14.5697 22 14.188 21.7246 14.0518 21.3164L8.2793 4H3C2.44772 4 2 3.55228 2 3C2 2.44772 2.44772 2 3 2H9ZM21 2C21.5523 2 22 2.44772 22 3C22 3.55228 21.5523 4 21 4H14C13.4477 4 13 3.55228 13 3C13 2.44772 13.4477 2 14 2H21Z'
      fill='currentColor'
    />
  </SvgIcon>
);

Option.displayName = 'OptionIcon';
