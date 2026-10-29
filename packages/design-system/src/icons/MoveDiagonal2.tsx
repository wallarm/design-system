import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MoveDiagonal2: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M4 11V5C4 4.44772 4.44772 4 5 4H11C11.5523 4 12 4.44772 12 5C12 5.55228 11.5523 6 11 6H7.41406L18 16.5859V13C18 12.4477 18.4477 12 19 12C19.5523 12 20 12.4477 20 13V19C20 19.5523 19.5523 20 19 20H13C12.4477 20 12 19.5523 12 19C12 18.4477 12.4477 18 13 18H16.5859L6 7.41406V11C6 11.5523 5.55228 12 5 12C4.44772 12 4 11.5523 4 11Z'
      fill='currentColor'
    />
  </SvgIcon>
);

MoveDiagonal2.displayName = 'MoveDiagonal2Icon';
