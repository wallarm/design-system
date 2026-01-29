import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Layers2: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="m16.02 12 5.48 3.13-9.5 5.37-9.5-5.37L7.98 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="m21.5 7.13-9.5 5.37-9.5-5.37 9.5-5.37 9.5 5.37Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);

Layers2.displayName = 'Layers2Icon';
