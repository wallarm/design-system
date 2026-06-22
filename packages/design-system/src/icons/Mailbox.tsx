import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Mailbox: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z' />
    <polyline points='15,9 18,9 18,11' />
    <path d='M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2' />
    <line x1='6' x2='7' y1='10' y2='10' />
  </SvgIcon>
);

Mailbox.displayName = 'MailboxIcon';
