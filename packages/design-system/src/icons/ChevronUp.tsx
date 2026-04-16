import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ChevronUp: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M11.3691 8.22462C11.7619 7.90427 12.3409 7.92686 12.707 8.29298L18.707 14.293C19.0975 14.6835 19.0975 15.3165 18.707 15.707C18.3165 16.0976 17.6835 16.0976 17.293 15.707L12 10.4141L6.70702 15.707C6.31649 16.0976 5.68348 16.0976 5.29295 15.707C4.90243 15.3165 4.90243 14.6835 5.29295 14.293L11.293 8.29298L11.3691 8.22462Z'
      fill='currentColor'
    />
  </SvgIcon>
);

ChevronUp.displayName = 'ChevronUpIcon';
