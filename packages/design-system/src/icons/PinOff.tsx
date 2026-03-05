import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const PinOff: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M12 17v5'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='m2 2 20 20'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

PinOff.displayName = 'PinOffIcon';
