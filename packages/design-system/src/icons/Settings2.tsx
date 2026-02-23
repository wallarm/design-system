import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Settings2: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M20 7h-9'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M14 17H5'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <circle
      cx='17'
      cy='17'
      r='3'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <circle
      cx='7'
      cy='7'
      r='3'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

Settings2.displayName = 'Settings2Icon';
