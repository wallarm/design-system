import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ChartColumn: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M3 3v16a2 2 0 0 0 2 2h16' />
    <path d='M18 17V9' />
    <path d='M13 17V5' />
    <path d='M8 17v-3' />
  </SvgIcon>
);

ChartColumn.displayName = 'ChartColumnIcon';
