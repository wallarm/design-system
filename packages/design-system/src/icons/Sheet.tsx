import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Sheet: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <rect
      width='18'
      height='18'
      x='3'
      y='3'
      rx='2'
      ry='2'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <line
      x1='3'
      x2='21'
      y1='9'
      y2='9'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <line
      x1='3'
      x2='21'
      y1='15'
      y2='15'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <line
      x1='9'
      x2='9'
      y1='9'
      y2='21'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <line
      x1='15'
      x2='15'
      y1='9'
      y2='21'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </SvgIcon>
);

Sheet.displayName = 'SheetIcon';
