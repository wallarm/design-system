import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MoveHorizontal: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='m18 8 4 4-4 4' />
    <path d='M2 12h20' />
    <path d='m6 8-4 4 4 4' />
  </SvgIcon>
);

MoveHorizontal.displayName = 'MoveHorizontalIcon';
