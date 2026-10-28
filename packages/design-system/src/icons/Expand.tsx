import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Expand: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M20 3C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3H20ZM5 19H19V5H5V19ZM13.0049 11H17V13H13.0049V17H11.0049V13H7V11H11.0049V7H13.0049V11Z'
      fill='currentColor'
    />
  </SvgIcon>
);

Expand.displayName = 'ExpandIcon';
