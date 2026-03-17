import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Copy: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <rect
      width='14'
      height='14'
      x='8'
      y='8'
      rx='2'
      ry='2'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

Copy.displayName = 'CopyIcon';
