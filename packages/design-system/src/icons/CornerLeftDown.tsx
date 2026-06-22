import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const CornerLeftDown: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='m14 15-5 5-5-5' />
    <path d='M20 4h-7a4 4 0 0 0-4 4v12' />
  </SvgIcon>
);

CornerLeftDown.displayName = 'CornerLeftDownIcon';
