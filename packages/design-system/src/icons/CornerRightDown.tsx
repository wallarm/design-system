import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const CornerRightDown: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='m10 15 5 5 5-5' />
    <path d='M4 4h7a4 4 0 0 1 4 4v12' />
  </SvgIcon>
);

CornerRightDown.displayName = 'CornerRightDownIcon';
