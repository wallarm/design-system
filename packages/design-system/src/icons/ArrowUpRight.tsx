import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ArrowUpRight: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="M7 7h10v10M7 17 17 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);

ArrowUpRight.displayName = 'ArrowUpRightIcon';
