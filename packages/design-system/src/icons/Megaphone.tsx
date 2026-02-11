import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Megaphone: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M3 11v3a1 1 0 0 0 1 1h14l7-7V6l-7-7H4a1 1 0 0 0-1 1v11z'
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
  </SvgIcon>
);

Megaphone.displayName = 'MegaphoneIcon';
