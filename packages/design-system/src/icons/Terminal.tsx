import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Terminal: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M12 19h8' />
    <path d='m4 17 6-6-6-6' />
  </SvgIcon>
);

Terminal.displayName = 'TerminalIcon';
