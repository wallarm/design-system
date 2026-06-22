import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const CreditCard: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <rect width='20' height='14' x='2' y='5' rx='2' />
    <line x1='2' x2='22' y1='10' y2='10' />
  </SvgIcon>
);

CreditCard.displayName = 'CreditCardIcon';
