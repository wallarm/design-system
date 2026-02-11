import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const PencilOff: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='m10 10-6.157 6.162a2 2 0 0 0-.5.833L2 20l2.005-1.343a2 2 0 0 0 .833-.5L10.996 12'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='m12.829 7.172 4.359-4.346a1 1 0 1 1 3.986 3.986l-4.353 4.353'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='m15 5 4 4'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='m2 2 20 20'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

PencilOff.displayName = 'PencilOffIcon';
