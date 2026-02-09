import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Activity: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='m22 12-4-4-6 6-2-2-4 4'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

Activity.displayName = 'ActivityIcon';
