import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const SquarePlus: FC<SvgIconProps> = props => (
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
    <path d='M8 12h8' />
    <path d='M12 8v8' />
  </SvgIcon>
);

SquarePlus.displayName = 'SquarePlusIcon';
