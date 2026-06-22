import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ListMinus: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M16 5H3' />
    <path d='M11 12H3' />
    <path d='M16 19H3' />
    <path d='M21 12h-6' />
  </SvgIcon>
);

ListMinus.displayName = 'ListMinusIcon';
