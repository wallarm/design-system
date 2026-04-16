import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const LayoutPanelLeft: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M4 4V20H9V4H4ZM15 15V20H20V15H15ZM15 4V9H20V4H15ZM22 20C22 21.1046 21.1046 22 20 22H15C13.8954 22 13 21.1046 13 20V15C13 13.8954 13.8954 13 15 13H20C21.1046 13 22 13.8954 22 15V20ZM11 20C11 21.1046 10.1046 22 9 22H4C2.89543 22 2 21.1046 2 20V4C2 2.89543 2.89543 2 4 2H9C10.1046 2 11 2.89543 11 4V20ZM22 9C22 10.1046 21.1046 11 20 11H15C13.8954 11 13 10.1046 13 9V4C13 2.89543 13.8954 2 15 2H20C21.1046 2 22 2.89543 22 4V9Z'
      fill='currentColor'
    />
  </SvgIcon>
);

LayoutPanelLeft.displayName = 'LayoutPanelLeftIcon';
