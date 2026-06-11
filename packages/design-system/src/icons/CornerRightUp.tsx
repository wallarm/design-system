import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const CornerRightUp: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='m10 9 5-5 5 5' />
    <path d='M4 20h7a4 4 0 0 0 4-4V4' />
  </SvgIcon>
);

CornerRightUp.displayName = 'CornerRightUpIcon';
