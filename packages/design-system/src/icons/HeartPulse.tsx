import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const HeartPulse: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5' />
    <path d='M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27' />
  </SvgIcon>
);

HeartPulse.displayName = 'HeartPulseIcon';
