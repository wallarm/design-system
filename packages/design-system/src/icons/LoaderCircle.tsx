import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const LoaderCircle: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M21 12a9 9 0 1 1-6.219-8.56'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

LoaderCircle.displayName = 'LoaderCircleIcon';
