import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MoveUp: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M11 22V4.41407L8.70702 6.70704C8.31649 7.09757 7.68348 7.09757 7.29295 6.70704C6.90243 6.31652 6.90243 5.6835 7.29295 5.29298L11.293 1.29298L11.3691 1.22462C11.7619 0.904269 12.3409 0.926863 12.707 1.29298L16.707 5.29298C17.0975 5.6835 17.0975 6.31652 16.707 6.70704C16.3165 7.09757 15.6835 7.09757 15.293 6.70704L13 4.41407V22C13 22.5523 12.5523 23 12 23C11.4477 23 11 22.5523 11 22Z'
      fill='currentColor'
    />
  </SvgIcon>
);

MoveUp.displayName = 'MoveUpIcon';
