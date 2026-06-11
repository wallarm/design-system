import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Merge: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='m8 6 4-4 4 4' />
    <path d='M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22' />
    <path d='m20 22-5-5' />
  </SvgIcon>
);

Merge.displayName = 'MergeIcon';
