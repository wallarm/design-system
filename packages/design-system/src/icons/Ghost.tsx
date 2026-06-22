import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Ghost: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M9 10h.01' />
    <path d='M15 10h.01' />
    <path d='M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z' />
  </SvgIcon>
);

Ghost.displayName = 'GhostIcon';
