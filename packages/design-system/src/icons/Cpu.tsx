import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Cpu: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M12 20v2' />
    <path d='M12 2v2' />
    <path d='M17 20v2' />
    <path d='M17 2v2' />
    <path d='M2 12h2' />
    <path d='M2 17h2' />
    <path d='M2 7h2' />
    <path d='M20 12h2' />
    <path d='M20 17h2' />
    <path d='M20 7h2' />
    <path d='M7 20v2' />
    <path d='M7 2v2' />
    <rect x='4' y='4' width='16' height='16' rx='2' />
    <rect x='8' y='8' width='8' height='8' rx='1' />
  </SvgIcon>
);

Cpu.displayName = 'CpuIcon';
