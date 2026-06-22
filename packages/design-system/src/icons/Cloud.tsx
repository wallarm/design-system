import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Cloud: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z' />
  </SvgIcon>
);

Cloud.displayName = 'CloudIcon';
