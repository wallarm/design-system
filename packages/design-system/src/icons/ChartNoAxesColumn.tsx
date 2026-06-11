import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ChartNoAxesColumn: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M5 21v-6' />
    <path d='M12 21V3' />
    <path d='M19 21V9' />
  </SvgIcon>
);

ChartNoAxesColumn.displayName = 'ChartNoAxesColumnIcon';
