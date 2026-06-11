import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const PanelsRightBottom: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <rect width='18' height='18' x='3' y='3' rx='2' />
    <path d='M3 15h12' />
    <path d='M15 3v18' />
  </SvgIcon>
);

PanelsRightBottom.displayName = 'PanelsRightBottomIcon';
