import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const CircleArrowOutUpLeft: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="M2 8V2h6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="m2 2 10 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M12 2A10 10 0 1 1 2 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);

CircleArrowOutUpLeft.displayName = 'CircleArrowOutUpLeftIcon';
