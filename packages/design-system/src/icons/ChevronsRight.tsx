import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ChevronsRight: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="m13 17 5-5-5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="m6 17 5-5-5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);

ChevronsRight.displayName = 'ChevronsRightIcon';
