import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Target: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <circle cx='12' cy='12' r='10' />
    <circle cx='12' cy='12' r='6' />
    <circle cx='12' cy='12' r='2' />
  </SvgIcon>
);

Target.displayName = 'TargetIcon';
