import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MoveUpLeft: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M5 11V5H11' />
    <path d='M5 5L19 19' />
  </SvgIcon>
);

MoveUpLeft.displayName = 'MoveUpLeftIcon';
