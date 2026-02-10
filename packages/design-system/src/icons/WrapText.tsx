import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const WrapText: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <line
      x1='3'
      y1='6'
      x2='21'
      y2='6'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M3 12h15a3 3 0 1 1 0 6h-4'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <polyline
      points='16 16 14 18 16 20'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <line
      x1='3'
      y1='18'
      x2='10'
      y2='18'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </SvgIcon>
);

WrapText.displayName = 'WrapTextIcon';
