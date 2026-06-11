import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Bandage: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M10 10.01h.01' />
    <path d='M10 14.01h.01' />
    <path d='M14 10.01h.01' />
    <path d='M14 14.01h.01' />
    <path d='M18 6v12' />
    <path d='M6 6v12' />
    <rect x='2' y='6' width='20' height='12' rx='2' />
  </SvgIcon>
);

Bandage.displayName = 'BandageIcon';
