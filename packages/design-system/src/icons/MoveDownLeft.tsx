import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MoveDownLeft: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M11 19H5V13' />
    <path d='M19 5L5 19' />
  </SvgIcon>
);

MoveDownLeft.displayName = 'MoveDownLeftIcon';
