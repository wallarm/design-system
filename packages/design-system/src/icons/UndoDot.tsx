import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const UndoDot: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <circle
      cx='12'
      cy='17'
      r='1'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M3 7v6h6'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M21 17a9 9 0 0 1-9 9 9 9 0 0 1-6-2.3L3 21'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

UndoDot.displayName = 'UndoDotIcon';
