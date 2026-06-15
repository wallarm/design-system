import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Database: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <ellipse cx='12' cy='5' rx='9' ry='3' />
    <path d='M3 5V19A9 3 0 0 0 21 19V5' />
    <path d='M3 12A9 3 0 0 0 21 12' />
  </SvgIcon>
);

Database.displayName = 'DatabaseIcon';
