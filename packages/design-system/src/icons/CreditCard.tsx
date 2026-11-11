import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const CreditCard: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M21 11H3V17C3 17.5523 3.44772 18 4 18H20C20.5523 18 21 17.5523 21 17V11ZM21 7C21 6.44772 20.5523 6 20 6H4C3.44772 6 3 6.44772 3 7V9H21V7ZM23 17C23 18.6569 21.6569 20 20 20H4C2.34315 20 1 18.6569 1 17V7C1 5.34315 2.34315 4 4 4H20C21.6569 4 23 5.34315 23 7V17Z'
      fill='currentColor'
    />
  </SvgIcon>
);

CreditCard.displayName = 'CreditCardIcon';
