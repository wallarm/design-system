import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Percentage: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <line x1='19' x2='5' y1='5' y2='19' />
    <circle cx='6.5' cy='6.5' r='2.5' />
    <circle cx='17.5' cy='17.5' r='2.5' />
  </SvgIcon>
);

Percentage.displayName = 'PercentageIcon';
