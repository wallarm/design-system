import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const SendgridNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M24 0V16H16V23.9997H0.000188528L0.0001875 15.9999L0 16V7.99982H8.00001V0H24Z'
      fill='currentColor'
    />
    <path d='M0.000244141 23.9996H8.00026V15.9996H0.000244141V23.9996Z' fill='currentColor' />
    <path d='M16 16H24V7.99982H16V16Z' fill='currentColor' />
    <path d='M8 8.00001H16V0H8V8.00001Z' fill='currentColor' />
    <path d='M8 15.9998H16V7.99982H8V15.9998Z' fill='currentColor' />
    <path d='M16 8.00001H24V0H16V8.00001Z' fill='currentColor' />
  </SvgIcon>
);

SendgridNeutral.displayName = 'SendgridNeutralIcon';
