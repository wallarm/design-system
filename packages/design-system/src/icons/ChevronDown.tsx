import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ChevronDown: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="m6 9 6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);

ChevronDown.displayName = 'ChevronDownIcon';
