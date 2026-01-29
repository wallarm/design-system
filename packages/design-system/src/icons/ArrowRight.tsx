import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ArrowRight: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="M5 12h14m-7-7 7 7-7 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);

ArrowRight.displayName = 'ArrowRightIcon';
