import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Building: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M12 10h.01' />
    <path d='M12 14h.01' />
    <path d='M12 6h.01' />
    <path d='M16 10h.01' />
    <path d='M16 14h.01' />
    <path d='M16 6h.01' />
    <path d='M8 10h.01' />
    <path d='M8 14h.01' />
    <path d='M8 6h.01' />
    <path d='M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3' />
    <rect x='4' y='2' width='16' height='20' rx='2' />
  </SvgIcon>
);

Building.displayName = 'BuildingIcon';
