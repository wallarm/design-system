import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MoveDiagonal: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M20 11C20 11.5523 19.5523 12 19 12C18.4477 12 18 11.5523 18 11V7.41406L7.41406 18H11C11.5523 18 12 18.4477 12 19C12 19.5523 11.5523 20 11 20H5C4.44772 20 4 19.5523 4 19V13C4 12.4477 4.44772 12 5 12C5.55228 12 6 12.4477 6 13V16.5859L16.5859 6H13C12.4477 6 12 5.55228 12 5C12 4.44772 12.4477 4 13 4H19C19.5523 4 20 4.44772 20 5V11Z'
      fill='currentColor'
    />
  </SvgIcon>
);

MoveDiagonal.displayName = 'MoveDiagonalIcon';
