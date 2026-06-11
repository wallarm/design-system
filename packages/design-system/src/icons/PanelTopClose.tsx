import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const PanelTopClose: FC<SvgIconProps> = props => (
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
    <path d='M3 9h18' />
    <path d='m9 16 3-3 3 3' />
  </SvgIcon>
);

PanelTopClose.displayName = 'PanelTopCloseIcon';
