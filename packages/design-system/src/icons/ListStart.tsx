import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ListStart: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M3 5h6' />
    <path d='M3 12h13' />
    <path d='M3 19h13' />
    <path d='m16 8-3-3 3-3' />
    <path d='M21 19V7a2 2 0 0 0-2-2h-6' />
  </SvgIcon>
);

ListStart.displayName = 'ListStartIcon';
