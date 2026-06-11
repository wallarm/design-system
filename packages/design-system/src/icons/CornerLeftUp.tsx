import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const CornerLeftUp: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M14 9 9 4 4 9' />
    <path d='M20 20h-7a4 4 0 0 1-4-4V4' />
  </SvgIcon>
);

CornerLeftUp.displayName = 'CornerLeftUpIcon';
