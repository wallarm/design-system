import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Filter: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <polygon
      points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);

Filter.displayName = 'FilterIcon';
