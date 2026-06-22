import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Speed: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='m12 14 4-4' />
    <path d='M3.34 19a10 10 0 1 1 17.32 0' />
  </SvgIcon>
);

Speed.displayName = 'SpeedIcon';
