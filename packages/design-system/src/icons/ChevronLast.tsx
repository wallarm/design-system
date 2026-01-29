import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ChevronLast: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="m7 18 6-6-6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M17 6v12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);

ChevronLast.displayName = 'ChevronLastIcon';
