import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ArrowLeft: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='m12 19-7-7 7-7M5 12h14'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

ArrowLeft.displayName = 'ArrowLeftIcon';
