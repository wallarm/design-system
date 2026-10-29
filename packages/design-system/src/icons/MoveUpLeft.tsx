import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MoveUpLeft: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M4 11V5C4 4.44772 4.44772 4 5 4H11C11.5523 4 12 4.44772 12 5C12 5.55228 11.5523 6 11 6H7.41406L19.707 18.293C20.0976 18.6835 20.0976 19.3165 19.707 19.707C19.3165 20.0976 18.6835 20.0976 18.293 19.707L6 7.41406V11C6 11.5523 5.55228 12 5 12C4.44772 12 4 11.5523 4 11Z'
      fill='currentColor'
    />
  </SvgIcon>
);

MoveUpLeft.displayName = 'MoveUpLeftIcon';
