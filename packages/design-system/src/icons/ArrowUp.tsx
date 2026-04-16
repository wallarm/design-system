import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ArrowUp: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M11 19V7.41407L5.70703 12.707C5.31651 13.0976 4.68349 13.0976 4.29297 12.707C3.90245 12.3165 3.90245 11.6835 4.29297 11.293L11.293 4.29298L11.3691 4.22462C11.7619 3.90427 12.3409 3.92686 12.707 4.29298L19.707 11.293C20.0976 11.6835 20.0976 12.3165 19.707 12.707C19.3165 13.0976 18.6835 13.0976 18.293 12.707L13 7.41407V19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19Z'
      fill='currentColor'
    />
  </SvgIcon>
);

ArrowUp.displayName = 'ArrowUpIcon';
