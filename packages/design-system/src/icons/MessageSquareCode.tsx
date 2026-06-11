import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MessageSquareCode: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z' />
    <path d='m10 8-3 3 3 3' />
    <path d='m14 14 3-3-3-3' />
  </SvgIcon>
);

MessageSquareCode.displayName = 'MessageSquareCodeIcon';
