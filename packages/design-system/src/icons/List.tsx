import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const List: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M3 5h.01' />
    <path d='M3 12h.01' />
    <path d='M3 19h.01' />
    <path d='M8 5h13' />
    <path d='M8 12h13' />
    <path d='M8 19h13' />
  </SvgIcon>
);

List.displayName = 'ListIcon';
