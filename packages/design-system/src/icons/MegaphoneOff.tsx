import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MegaphoneOff: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M9.26 9.26 3 11v3l14.14 3.14'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M21 15.34V6l-7.31 2.03'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M11.6 16.8a3 3 0 1 1-5.8-1.6'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M2 2 22 22'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

MegaphoneOff.displayName = 'MegaphoneOffIcon';
