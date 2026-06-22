import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const CircleMinus: FC<SvgIconProps> = props => (
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
    <path d='M8 12h8' />
  </SvgIcon>
);

CircleMinus.displayName = 'CircleMinusIcon';
