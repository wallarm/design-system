import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Download: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M12 15V3' />
    <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
    <path d='m7 10 5 5 5-5' />
  </SvgIcon>
);

Download.displayName = 'DownloadIcon';
