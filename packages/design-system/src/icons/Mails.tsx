import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Mails: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M17 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 1-1.732' />
    <path d='m22 5.5-6.419 4.179a2 2 0 0 1-2.162 0L7 5.5' />
    <rect x='7' y='3' width='15' height='12' rx='2' />
  </SvgIcon>
);

Mails.displayName = 'MailsIcon';
