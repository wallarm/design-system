import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MoveUpRight: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M13 5H19V11' />
    <path d='M19 5L5 19' />
  </SvgIcon>
);

MoveUpRight.displayName = 'MoveUpRightIcon';
