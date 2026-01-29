import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ArrowUp: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="m5 12 7-7 7 7M12 19V5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);

ArrowUp.displayName = 'ArrowUpIcon';
