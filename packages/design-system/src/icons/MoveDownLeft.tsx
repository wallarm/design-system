import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MoveDownLeft: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M18.293 4.29295C18.6835 3.90243 19.3165 3.90243 19.707 4.29295C20.0976 4.68348 20.0976 5.31649 19.707 5.70702L7.41406 18H11C11.5523 18 12 18.4477 12 19C12 19.5523 11.5523 20 11 20H5C4.44772 20 4 19.5523 4 19V13C4 12.4477 4.44772 12 5 12C5.55228 12 6 12.4477 6 13V16.5859L18.293 4.29295Z'
      fill='currentColor'
    />
  </SvgIcon>
);

MoveDownLeft.displayName = 'MoveDownLeftIcon';
