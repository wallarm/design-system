import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ListCollapse: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M10 5h11' />
    <path d='M10 12h11' />
    <path d='M10 19h11' />
    <path d='m3 10 3-3-3-3' />
    <path d='m3 20 3-3-3-3' />
  </SvgIcon>
);

ListCollapse.displayName = 'ListCollapseIcon';
