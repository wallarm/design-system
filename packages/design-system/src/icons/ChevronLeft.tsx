import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ChevronLeft: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="m15 18-6-6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);

ChevronLeft.displayName = 'ChevronLeftIcon';
