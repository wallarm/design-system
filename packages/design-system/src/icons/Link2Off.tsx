import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Link2Off: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M9 17H7A5 5 0 0 1 7 7' />
    <path d='M15 7h2a5 5 0 0 1 4 8' />
    <line x1='8' x2='12' y1='12' y2='12' />
    <line x1='2' x2='22' y1='2' y2='22' />
  </SvgIcon>
);

Link2Off.displayName = 'Link2OffIcon';
