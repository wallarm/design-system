import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Code: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='m16 18 6-6-6-6' />
    <path d='m8 6-6 6 6 6' />
  </SvgIcon>
);

Code.displayName = 'CodeIcon';
