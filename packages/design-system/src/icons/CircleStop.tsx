import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const CircleStop: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <circle cx='12' cy='12' r='10' />
    <rect x='9' y='9' width='6' height='6' rx='1' />
  </SvgIcon>
);

CircleStop.displayName = 'CircleStopIcon';
