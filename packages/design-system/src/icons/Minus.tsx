import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Minus: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M5 12h14'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

Minus.displayName = 'MinusIcon';
