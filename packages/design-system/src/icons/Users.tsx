import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Users: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
    <path d='M16 3.128a4 4 0 0 1 0 7.744' />
    <path d='M22 21v-2a4 4 0 0 0-3-3.87' />
    <circle cx='9' cy='7' r='4' />
  </SvgIcon>
);

Users.displayName = 'UsersIcon';
