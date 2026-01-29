import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ArrowBigUpDash: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="M9 19h6v-6h4l-7-7-7 7h4v6Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M9 22h6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);

ArrowBigUpDash.displayName = 'ArrowBigUpDashIcon';
