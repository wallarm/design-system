import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Share: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M12 2v13' />
    <path d='m16 6-4-4-4 4' />
    <path d='M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8' />
  </SvgIcon>
);

Share.displayName = 'ShareIcon';
