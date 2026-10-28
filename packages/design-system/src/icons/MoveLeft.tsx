import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MoveLeft: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M5.29295 7.29295C5.68348 6.90243 6.31649 6.90243 6.70702 7.29295C7.09754 7.68348 7.09754 8.31649 6.70702 8.70702L4.41405 11H22C22.5523 11 23 11.4477 23 12C23 12.5523 22.5523 13 22 13H4.41405L6.70702 15.293C7.09754 15.6835 7.09754 16.3165 6.70702 16.707C6.31649 17.0975 5.68348 17.0975 5.29295 16.707L1.29295 12.707C0.90243 12.3165 0.90243 11.6835 1.29295 11.293L5.29295 7.29295Z'
      fill='currentColor'
    />
  </SvgIcon>
);

MoveLeft.displayName = 'MoveLeftIcon';
