import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ScanLine: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M3 7V5a2 2 0 0 1 2-2h2' />
    <path d='M17 3h2a2 2 0 0 1 2 2v2' />
    <path d='M21 17v2a2 2 0 0 1-2 2h-2' />
    <path d='M7 21H5a2 2 0 0 1-2-2v-2' />
    <path d='M7 12h10' />
  </SvgIcon>
);

ScanLine.displayName = 'ScanLineIcon';
