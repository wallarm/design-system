import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const CircleHelp: FC<SvgIconProps> = props => (
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
      d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M12 17h.01'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

CircleHelp.displayName = 'CircleHelpIcon';
