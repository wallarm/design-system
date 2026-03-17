import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const GripVertical: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <circle cx='9' cy='12' r='1' stroke='currentColor' strokeWidth='2' fill='none' />
    <circle cx='9' cy='5' r='1' stroke='currentColor' strokeWidth='2' fill='none' />
    <circle cx='9' cy='19' r='1' stroke='currentColor' strokeWidth='2' fill='none' />
    <circle cx='15' cy='12' r='1' stroke='currentColor' strokeWidth='2' fill='none' />
    <circle cx='15' cy='5' r='1' stroke='currentColor' strokeWidth='2' fill='none' />
    <circle cx='15' cy='19' r='1' stroke='currentColor' strokeWidth='2' fill='none' />
  </SvgIcon>
);

GripVertical.displayName = 'GripVerticalIcon';
