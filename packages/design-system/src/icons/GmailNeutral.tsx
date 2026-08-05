import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const GmailNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(0, 2.99775)'>
        <path
          d='M5.45455 18.0045H1.63636C0.733636 18.0045 0 17.2736 0 16.3681V2.45919C0 0.435551 2.30727 -0.718085 3.92727 0.495551L12 6.54996L20.0727 0.495551C21.69 -0.718085 24 0.435551 24 2.45919V16.3681C24 17.2709 23.2691 18.0045 22.3636 18.0045H18.5454V8.73178L12 13.6409L5.45456 8.73178L5.45455 18.0045Z'
          fill='#0F172B'
        />
      </g>
  </SvgIcon>
);

GmailNeutral.displayName = 'GmailNeutralIcon';
