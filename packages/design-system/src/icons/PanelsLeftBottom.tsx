import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const PanelsLeftBottom: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M20 16H10V20H19C19.5523 20 20 19.5523 20 19V16ZM20 5C20 4.44771 19.5523 4 19 4H10V14H20V5ZM4 19C4 19.5523 4.44771 20 5 20H8V4H5C4.44772 4 4 4.44772 4 5V19ZM22 19C22 20.6569 20.6569 22 19 22H5C3.34315 22 2 20.6569 2 19V5C2 3.34315 3.34315 2 5 2H19C20.6569 2 22 3.34315 22 5V19Z'
      fill='currentColor'
    />
  </SvgIcon>
);

PanelsLeftBottom.displayName = 'PanelsLeftBottomIcon';
