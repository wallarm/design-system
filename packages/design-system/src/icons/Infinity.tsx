import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

// biome-ignore lint/suspicious/noShadowRestrictedNames: icon name matches Lucide convention
export const Infinity: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M6 16c5 0 7-8 12-8a4 4 0 0 1 0 8c-5 0-7-8-12-8a4 4 0 1 0 0 8' />
  </SvgIcon>
);

Infinity.displayName = 'InfinityIcon';
