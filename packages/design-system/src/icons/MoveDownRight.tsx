import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MoveDownRight: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M19 13V19H13' />
    <path d='M5 5L19 19' />
  </SvgIcon>
);

MoveDownRight.displayName = 'MoveDownRightIcon';
