import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const PanelBottomOpen: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <rect
      width="18"
      height="7"
      x="3"
      y="3"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <rect
      width="18"
      height="7"
      x="3"
      y="14"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="m14 17-3-3 3-3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);

PanelBottomOpen.displayName = 'PanelBottomOpenIcon';
