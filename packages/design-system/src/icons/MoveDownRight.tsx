import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MoveDownRight: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M4.29295 4.29295C4.68348 3.90243 5.31649 3.90243 5.70702 4.29295L18 16.5859V13C18 12.4477 18.4477 12 19 12C19.5523 12 20 12.4477 20 13V19C20 19.5523 19.5523 20 19 20H13C12.4477 20 12 19.5523 12 19C12 18.4477 12.4477 18 13 18H16.5859L4.29295 5.70702C3.90243 5.31649 3.90243 4.68348 4.29295 4.29295Z'
      fill='currentColor'
    />
  </SvgIcon>
);

MoveDownRight.displayName = 'MoveDownRightIcon';
