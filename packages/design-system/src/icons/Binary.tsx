import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Binary: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <rect x='14' y='14' width='4' height='6' rx='2' />
    <rect x='6' y='4' width='4' height='6' rx='2' />
    <path d='M6 20h4' />
    <path d='M14 10h4' />
    <path d='M6 14h2v6' />
    <path d='M14 4h2v6' />
  </SvgIcon>
);

Binary.displayName = 'BinaryIcon';
