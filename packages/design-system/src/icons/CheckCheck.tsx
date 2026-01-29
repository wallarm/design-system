import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const CheckCheck: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="M9 11l3 3L22 4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M21 12c0 5-4 9-9 9s-9-4-9-9 4-9 9-9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);

CheckCheck.displayName = 'CheckCheckIcon';
