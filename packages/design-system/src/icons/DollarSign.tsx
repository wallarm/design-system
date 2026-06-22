import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const DollarSign: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <line x1='12' x2='12' y1='2' y2='22' />
    <path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
  </SvgIcon>
);

DollarSign.displayName = 'DollarSignIcon';
