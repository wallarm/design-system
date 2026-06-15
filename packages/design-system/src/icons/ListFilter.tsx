import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ListFilter: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M2 5h20' />
    <path d='M6 12h12' />
    <path d='M9 19h6' />
  </SvgIcon>
);

ListFilter.displayName = 'ListFilterIcon';
