import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const UserRoundX: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M2 21a8 8 0 0 1 11.873-7' />
    <circle cx='10' cy='8' r='5' />
    <path d='m17 17 5 5' />
    <path d='m22 17-5 5' />
  </SvgIcon>
);

UserRoundX.displayName = 'UserRoundXIcon';
