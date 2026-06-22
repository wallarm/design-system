import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const PanelLeftOpen: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <rect width='18' height='18' x='3' y='3' rx='2' />
    <path d='M9 3v18' />
    <path d='m14 9 3 3-3 3' />
  </SvgIcon>
);

PanelLeftOpen.displayName = 'PanelLeftOpenIcon';
