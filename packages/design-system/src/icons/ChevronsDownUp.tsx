import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ChevronsDownUp: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='m7 20 5-5 5 5' />
    <path d='m7 4 5 5 5-5' />
  </SvgIcon>
);

ChevronsDownUp.displayName = 'ChevronsDownUpIcon';
