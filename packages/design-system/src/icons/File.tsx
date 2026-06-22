import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const File: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z' />
    <path d='M14 2v5a1 1 0 0 0 1 1h5' />
  </SvgIcon>
);

File.displayName = 'FileIcon';
