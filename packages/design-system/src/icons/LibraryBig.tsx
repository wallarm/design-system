import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const LibraryBig: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <rect
      width='8'
      height='18'
      x='3'
      y='3'
      rx='1'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='m7 3 .2 3a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L19 3'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <rect
      width='2'
      height='14'
      x='13'
      y='7'
      rx='1'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <rect
      width='2'
      height='10'
      x='17'
      y='11'
      rx='1'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

LibraryBig.displayName = 'LibraryBigIcon';
