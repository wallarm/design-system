import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Maximize: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M8 3H5a2 2 0 0 0-2 2v3'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M16 3h3a2 2 0 0 1 2 2v3'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M3 16v3a2 2 0 0 0 2 2h3'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M21 16v3a2 2 0 0 1-2 2h-3'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

Maximize.displayName = 'MaximizeIcon';
