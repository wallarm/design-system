import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Ellipsis: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <circle
      cx='12'
      cy='12'
      r='1'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <circle
      cx='19'
      cy='12'
      r='1'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <circle
      cx='5'
      cy='12'
      r='1'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

Ellipsis.displayName = 'EllipsisIcon';
