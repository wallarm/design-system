import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MoveUpRight: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M20 11C20 11.5523 19.5523 12 19 12C18.4477 12 18 11.5523 18 11V7.41406L5.70702 19.707C5.31649 20.0976 4.68348 20.0976 4.29295 19.707C3.90243 19.3165 3.90243 18.6835 4.29295 18.293L16.5859 6H13C12.4477 6 12 5.55228 12 5C12 4.44772 12.4477 4 13 4H19C19.5523 4 20 4.44772 20 5V11Z'
      fill='currentColor'
    />
  </SvgIcon>
);

MoveUpRight.displayName = 'MoveUpRightIcon';
