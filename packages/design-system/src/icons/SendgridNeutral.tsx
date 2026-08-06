import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const SendgridNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(0, 0.00015)'>
      <path
        d='M24 0V16H16V23.9997H0.000188528L0.0001875 15.9999L0 16V7.99982H8.00001V0H24Z'
        fill='currentColor'
      />
      <path d='M0.000188528 23.9997H8.0002V15.9996H0.000188528V23.9997Z' fill='currentColor' />
      <path d='M16 16H24V7.99982H16V16Z' fill='currentColor' />
      <path d='M8.00001 8.00001H16V0H8.00001V8.00001Z' fill='currentColor' />
      <path d='M8.00001 15.9998H16V7.99982H8.00001V15.9998Z' fill='currentColor' />
      <path d='M16 8.00001H24V0H16V8.00001Z' fill='currentColor' />
    </g>
  </SvgIcon>
);

SendgridNeutral.displayName = 'SendgridNeutralIcon';
