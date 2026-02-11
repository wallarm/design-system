import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Search: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <circle
      cx='11'
      cy='11'
      r='8'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='m21 21-4.35-4.35'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

Search.displayName = 'SearchIcon';
