import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const NotebookTabs: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M2 6h4' />
    <path d='M2 10h4' />
    <path d='M2 14h4' />
    <path d='M2 18h4' />
    <rect width='16' height='20' x='4' y='2' rx='2' />
    <path d='M15 2v20' />
    <path d='M15 7h5' />
    <path d='M15 12h5' />
    <path d='M15 17h5' />
  </SvgIcon>
);

NotebookTabs.displayName = 'NotebookTabsIcon';
