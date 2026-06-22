import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const CopySlash: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <line x1='12' x2='18' y1='18' y2='12' />
    <rect width='14' height='14' x='8' y='8' rx='2' ry='2' />
    <path d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' />
  </SvgIcon>
);

CopySlash.displayName = 'CopySlashIcon';
