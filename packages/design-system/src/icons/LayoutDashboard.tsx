import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const LayoutDashboard: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <rect
      width="7"
      height="9"
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
      width="7"
      height="5"
      x="14"
      y="3"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <rect
      width="7"
      height="9"
      x="14"
      y="12"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <rect
      width="7"
      height="5"
      x="3"
      y="16"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);

LayoutDashboard.displayName = 'LayoutDashboardIcon';
