import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const LogIn: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='m10 17 5-5-5-5' />
    <path d='M15 12H3' />
    <path d='M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4' />
  </SvgIcon>
);

LogIn.displayName = 'LogInIcon';
