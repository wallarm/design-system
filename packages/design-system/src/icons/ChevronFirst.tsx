import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ChevronFirst: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="m17 18-6-6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M7 6v12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);

ChevronFirst.displayName = 'ChevronFirstIcon';
