import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MoveDiagonal2: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M19 13v6h-6' />
    <path d='M5 11V5h6' />
    <path d='m5 5 14 14' />
  </SvgIcon>
);

MoveDiagonal2.displayName = 'MoveDiagonal2Icon';
