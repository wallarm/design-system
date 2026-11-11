import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Sheet: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M19 2C20.6569 2 22 3.34315 22 5V19C22 20.6569 20.6569 22 19 22H5C3.34315 22 2 20.6569 2 19V5C2 3.34315 3.34315 2 5 2H19ZM4 19C4 19.5523 4.44772 20 5 20H8V16H4V19ZM16 20H19C19.5523 20 20 19.5523 20 19V16H16V20ZM10 20H14V16H10V20ZM4 14H8V10H4V14ZM16 14H20V10H16V14ZM10 14H14V10H10V14ZM5 4C4.44772 4 4 4.44772 4 5V8H20V5C20 4.44772 19.5523 4 19 4H5Z'
      fill='currentColor'
    />
  </SvgIcon>
);

Sheet.displayName = 'SheetIcon';
