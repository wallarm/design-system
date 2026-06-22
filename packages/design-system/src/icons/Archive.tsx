import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Archive: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <rect width='20' height='5' x='2' y='3' rx='1' />
    <path d='M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8' />
    <path d='M10 12h4' />
  </SvgIcon>
);

Archive.displayName = 'ArchiveIcon';
