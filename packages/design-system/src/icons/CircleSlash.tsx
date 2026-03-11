import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

/**
 * CircleSlash icon
 * Represents: disabled, unavailable, blocked, restricted, forbidden, not allowed
 */
export const CircleSlash: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <circle
      cx='12'
      cy='12'
      r='10'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M4.93 4.93l14.14 14.14'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

CircleSlash.displayName = 'CircleSlashIcon';
