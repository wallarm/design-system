import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MoveLeft: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M6 8L2 12L6 16' />
    <path d='M2 12H22' />
  </SvgIcon>
);

MoveLeft.displayName = 'MoveLeftIcon';
