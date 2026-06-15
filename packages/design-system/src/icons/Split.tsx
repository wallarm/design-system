import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Split: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M16 3h5v5' />
    <path d='M8 3H3v5' />
    <path d='M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3' />
    <path d='m15 9 6-6' />
  </SvgIcon>
);

Split.displayName = 'SplitIcon';
