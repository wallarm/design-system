import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const GripHorizontal: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <circle cx='12' cy='9' r='1' />
    <circle cx='19' cy='9' r='1' />
    <circle cx='5' cy='9' r='1' />
    <circle cx='12' cy='15' r='1' />
    <circle cx='19' cy='15' r='1' />
    <circle cx='5' cy='15' r='1' />
  </SvgIcon>
);

GripHorizontal.displayName = 'GripHorizontalIcon';
