import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const UserCheck: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='m16 11 2 2 4-4' />
    <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
    <circle cx='9' cy='7' r='4' />
  </SvgIcon>
);

UserCheck.displayName = 'UserCheckIcon';
