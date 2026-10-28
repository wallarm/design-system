import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Sendgrid: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M24 0V16H16V23.9997H0.000188528L0.0001875 15.9999L0 16V7.99982H8.00001V0H24Z'
      fill='#9DD6E3'
    />
    <path d='M0.000244141 23.9996H8.00026V15.9996H0.000244141V23.9996Z' fill='#3F72AB' />
    <path d='M16 16H24V7.99982H16V16Z' fill='#00A9D1' />
    <path d='M8 8.00001H16V0H8V8.00001Z' fill='#00A9D1' />
    <path d='M8 15.9998H16V7.99982H8V15.9998Z' fill='#2191C4' />
    <path d='M16 8.00001H24V0H16V8.00001Z' fill='#3F72AB' />
  </SvgIcon>
);

Sendgrid.displayName = 'SendgridIcon';
