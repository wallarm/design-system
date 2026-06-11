import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Option: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M3 3h6l6 18h6' />
    <path d='M14 3h7' />
  </SvgIcon>
);

Option.displayName = 'OptionIcon';
