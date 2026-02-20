import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const EllipsisVertical: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <circle cx='12' cy='12' r='1' fill='currentColor' />
    <circle cx='12' cy='5' r='1' fill='currentColor' />
    <circle cx='12' cy='19' r='1' fill='currentColor' />
  </SvgIcon>
);

EllipsisVertical.displayName = 'EllipsisVerticalIcon';
