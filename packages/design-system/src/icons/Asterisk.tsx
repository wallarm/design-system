import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Asterisk: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M12 6v12' />
    <path d='M17.196 9 6.804 15' />
    <path d='m6.804 9 10.392 6' />
  </SvgIcon>
);

Asterisk.displayName = 'AsteriskIcon';
