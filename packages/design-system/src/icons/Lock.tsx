import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Lock: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <rect
      width='18'
      height='11'
      x='3'
      y='11'
      rx='2'
      ry='2'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M7 11V7a5 5 0 0 1 10 0v4'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

Lock.displayName = 'LockIcon';
