import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const PanelRight: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <rect
      width='18'
      height='18'
      x='3'
      y='3'
      rx='2'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M15 3v18'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

PanelRight.displayName = 'PanelRightIcon';
