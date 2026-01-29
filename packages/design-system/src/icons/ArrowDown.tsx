import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ArrowDown: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="M12 5v14m7-7-7 7-7-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);

ArrowDown.displayName = 'ArrowDownIcon';
