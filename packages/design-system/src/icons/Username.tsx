import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Username: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <circle cx='8' cy='6' r='4' />
    <path d='M2 21a8 8 0 0 1 12.75-6.462' />
    <line x1='17' x2='22' y1='14' y2='14' />
    <line x1='17' x2='22' y1='18' y2='18' />
  </SvgIcon>
);

Username.displayName = 'UsernameIcon';
