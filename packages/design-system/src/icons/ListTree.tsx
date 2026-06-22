import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ListTree: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M8 5h13' />
    <path d='M13 12h8' />
    <path d='M13 19h8' />
    <path d='M3 10a2 2 0 0 0 2 2h3' />
    <path d='M3 5v12a2 2 0 0 0 2 2h3' />
  </SvgIcon>
);

ListTree.displayName = 'ListTreeIcon';
