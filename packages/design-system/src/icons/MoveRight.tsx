import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MoveRight: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M17.293 7.29295C17.6835 6.90243 18.3165 6.90243 18.707 7.29295L22.707 11.293C23.0976 11.6835 23.0976 12.3165 22.707 12.707L18.707 16.707C18.3165 17.0975 17.6835 17.0975 17.293 16.707C16.9024 16.3165 16.9024 15.6835 17.293 15.293L19.5859 13H2C1.44772 13 1 12.5523 1 12C1 11.4477 1.44772 11 2 11H19.5859L17.293 8.70702C16.9024 8.31649 16.9024 7.68348 17.293 7.29295Z'
      fill='currentColor'
    />
  </SvgIcon>
);

MoveRight.displayName = 'MoveRightIcon';
