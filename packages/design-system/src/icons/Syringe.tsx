import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Syringe: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='m18 2 4 4' />
    <path d='m17 7 3-3' />
    <path d='M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5' />
    <path d='m9 11 4 4' />
    <path d='m5 19-3 3' />
    <path d='m14 4 6 6' />
  </SvgIcon>
);

Syringe.displayName = 'SyringeIcon';
