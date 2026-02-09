import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ZoomOut: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <circle
      cx='11'
      cy='11'
      r='8'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M21 21l-4.35-4.35'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <line
      x1='8'
      x2='14'
      y1='11'
      y2='11'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </SvgIcon>
);

ZoomOut.displayName = 'ZoomOutIcon';
