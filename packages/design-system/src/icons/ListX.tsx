import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ListX: FC<SvgIconProps> = props => (
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
    <path d='m15.5 9.5 5 5' />
    <path d='m20.5 9.5-5 5' />
  </SvgIcon>
);

ListX.displayName = 'ListXIcon';
