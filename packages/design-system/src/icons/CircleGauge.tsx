import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const CircleGauge: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M15.6 2.7a10 10 0 1 0 5.7 5.7' />
    <circle cx='12' cy='12' r='2' />
    <path d='M13.4 10.6 19 5' />
  </SvgIcon>
);

CircleGauge.displayName = 'CircleGaugeIcon';
