import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MoveDown: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M11 2C11 1.44772 11.4477 1 12 1C12.5523 1 13 1.44772 13 2V19.5859L15.293 17.293C15.6835 16.9024 16.3165 16.9024 16.707 17.293C17.0975 17.6835 17.0975 18.3165 16.707 18.707L12.707 22.707C12.3165 23.0976 11.6835 23.0976 11.293 22.707L7.29295 18.707C6.90243 18.3165 6.90243 17.6835 7.29295 17.293C7.68348 16.9024 8.31649 16.9024 8.70702 17.293L11 19.5859V2Z'
      fill='currentColor'
    />
  </SvgIcon>
);

MoveDown.displayName = 'MoveDownIcon';
