import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ArrowUpDown: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='m21 16-4 4-4-4' />
    <path d='M17 20V4' />
    <path d='m3 8 4-4 4 4' />
    <path d='M7 4v16' />
  </SvgIcon>
);

ArrowUpDown.displayName = 'ArrowUpDownIcon';
