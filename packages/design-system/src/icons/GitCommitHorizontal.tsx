import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const GitCommitHorizontal: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <circle
      cx='12'
      cy='12'
      r='3'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='m3 12h6m6 0h6'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

GitCommitHorizontal.displayName = 'GitCommitHorizontalIcon';
