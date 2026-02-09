import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const LayoutGrid: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <rect
      width='7'
      height='7'
      x='3'
      y='3'
      rx='1'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <rect
      width='7'
      height='7'
      x='14'
      y='3'
      rx='1'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <rect
      width='7'
      height='7'
      x='14'
      y='14'
      rx='1'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <rect
      width='7'
      height='7'
      x='3'
      y='14'
      rx='1'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

LayoutGrid.displayName = 'LayoutGridIcon';
