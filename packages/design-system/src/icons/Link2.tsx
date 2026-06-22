import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Link2: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M9 17H7A5 5 0 0 1 7 7h2' />
    <path d='M15 7h2a5 5 0 1 1 0 10h-2' />
    <line x1='8' x2='16' y1='12' y2='12' />
  </SvgIcon>
);

Link2.displayName = 'Link2Icon';
