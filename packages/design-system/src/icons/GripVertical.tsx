import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const GripVertical: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <circle cx='9' cy='12' r='1' fill='currentColor' />
    <circle cx='9' cy='5' r='1' fill='currentColor' />
    <circle cx='9' cy='19' r='1' fill='currentColor' />
    <circle cx='15' cy='12' r='1' fill='currentColor' />
    <circle cx='15' cy='5' r='1' fill='currentColor' />
    <circle cx='15' cy='19' r='1' fill='currentColor' />
  </SvgIcon>
);

GripVertical.displayName = 'GripVerticalIcon';
