import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const LayoutTemplate: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M4 15V20H11V15H4ZM17 15V20H20V15H17ZM4 4V9H20V4H4ZM13 20C13 21.1046 12.1046 22 11 22H4C2.89543 22 2 21.1046 2 20V15C2 13.8954 2.89543 13 4 13H11C12.1046 13 13 13.8954 13 15V20ZM22 20C22 21.1046 21.1046 22 20 22H17C15.8954 22 15 21.1046 15 20V15C15 13.8954 15.8954 13 17 13H20C21.1046 13 22 13.8954 22 15V20ZM22 9C22 10.1046 21.1046 11 20 11H4C2.89543 11 2 10.1046 2 9V4C2 2.89543 2.89543 2 4 2H20C21.1046 2 22 2.89543 22 4V9Z'
      fill='currentColor'
    />
  </SvgIcon>
);

LayoutTemplate.displayName = 'LayoutTemplateIcon';
