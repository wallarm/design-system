import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const SearchX: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='m13.5 8.5-5 5' />
    <path d='m8.5 8.5 5 5' />
    <circle cx='11' cy='11' r='8' />
    <path d='m21 21-4.3-4.3' />
  </SvgIcon>
);

SearchX.displayName = 'SearchXIcon';
