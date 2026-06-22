import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ChartBar: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M3 3v16a2 2 0 0 0 2 2h16' />
    <path d='M7 16h8' />
    <path d='M7 11h12' />
    <path d='M7 6h3' />
  </SvgIcon>
);

ChartBar.displayName = 'ChartBarIcon';
