import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Menu: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M4 5h16' />
    <path d='M4 12h16' />
    <path d='M4 19h16' />
  </SvgIcon>
);

Menu.displayName = 'MenuIcon';
