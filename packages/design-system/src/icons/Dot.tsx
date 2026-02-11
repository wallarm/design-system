import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Dot: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    stroke='currentColor'
    stroke-width='2'
    stroke-linecap='round'
    stroke-linejoin='round'
  >
    <circle cx='12.1' cy='12.1' r='1' />
  </SvgIcon>
);

Dot.displayName = 'DotIcon';
