import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const CircleArrowOutUpRight: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M22 8V2h-6'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='m22 2-10 10'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M12 2A10 10 0 1 0 22 12'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

CircleArrowOutUpRight.displayName = 'CircleArrowOutUpRightIcon';
