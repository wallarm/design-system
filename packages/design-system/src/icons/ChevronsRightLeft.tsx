import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ChevronsRightLeft: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='m20 17-5-5 5-5' />
    <path d='m4 17 5-5-5-5' />
  </SvgIcon>
);

ChevronsRightLeft.displayName = 'ChevronsRightLeftIcon';
