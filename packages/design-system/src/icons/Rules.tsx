import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Rules: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <rect width='18' height='18' x='3' y='3' rx='2' />
    <path d='m9 12 2 2 4-4' />
  </SvgIcon>
);

Rules.displayName = 'RulesIcon';
