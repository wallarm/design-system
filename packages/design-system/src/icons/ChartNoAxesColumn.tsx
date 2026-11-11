import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ChartNoAxesColumn: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M6 11C6.55228 11 7 11.4477 7 12V21C7 21.5523 6.55228 22 6 22C5.44772 22 5 21.5523 5 21V12C5 11.4477 5.44772 11 6 11ZM12 2.5C12.5523 2.5 13 2.94772 13 3.5V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V3.5C11 2.94772 11.4477 2.5 12 2.5ZM18 8C18.5523 8 19 8.44772 19 9V21C19 21.5523 18.5523 22 18 22C17.4477 22 17 21.5523 17 21V9C17 8.44772 17.4477 8 18 8Z'
      fill='currentColor'
    />
  </SvgIcon>
);

ChartNoAxesColumn.displayName = 'ChartNoAxesColumnIcon';
