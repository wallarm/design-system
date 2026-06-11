import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const FlaskConical: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2' />
    <path d='M6.453 15h11.094' />
    <path d='M8.5 2h7' />
  </SvgIcon>
);

FlaskConical.displayName = 'FlaskConicalIcon';
