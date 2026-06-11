import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MoveDiagonal: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M11 19H5v-6' />
    <path d='M13 5h6v6' />
    <path d='M19 5 5 19' />
  </SvgIcon>
);

MoveDiagonal.displayName = 'MoveDiagonalIcon';
