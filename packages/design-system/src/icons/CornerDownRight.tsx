import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const CornerDownRight: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='m15 10 5 5-5 5' />
    <path d='M4 4v7a4 4 0 0 0 4 4h12' />
  </SvgIcon>
);

CornerDownRight.displayName = 'CornerDownRightIcon';
