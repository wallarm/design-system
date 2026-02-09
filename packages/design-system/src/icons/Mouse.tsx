import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Mouse: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <rect
      x='5'
      y='2'
      width='14'
      height='20'
      rx='7'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M12 6v4'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

Mouse.displayName = 'MouseIcon';
