import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Film: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M19 1C20.6569 1 22 2.34315 22 4V20C22 21.6569 20.6569 23 19 23H5C3.34315 23 2 21.6569 2 20V4C2 2.34315 3.34315 1 5 1H19ZM4 20C4 20.5523 4.44772 21 5 21H7.5V17H4V20ZM16.5 21H19C19.5523 21 20 20.5523 20 20V17H16.5V21ZM9.5 21H14.5V3H9.5V21ZM16.5 15H20V9H16.5V15ZM4 15H7.5V9H4V15ZM16.5 7H20V4C20 3.44772 19.5523 3 19 3H16.5V7ZM5 3C4.44772 3 4 3.44772 4 4V7H7.5V3H5Z'
      fill='currentColor'
    />
  </SvgIcon>
);

Film.displayName = 'FilmIcon';
