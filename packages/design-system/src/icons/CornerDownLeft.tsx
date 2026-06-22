import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const CornerDownLeft: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M20 4v7a4 4 0 0 1-4 4H4' />
    <path d='m9 10-5 5 5 5' />
  </SvgIcon>
);

CornerDownLeft.displayName = 'CornerDownLeftIcon';
