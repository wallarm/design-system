import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const BoostyNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(2.02445, 0)'>
        <path
          d='M0.636517 14.3365L4.7762 0H11.1381L9.85556 4.44444C9.84287 4.46984 9.83017 4.49524 9.81747 4.52063L6.43969 16.254H9.5889C8.26826 19.5429 7.23969 22.1206 6.50318 23.9873C0.687311 23.9238 -0.938086 19.7587 0.484136 14.8317M6.52858 24L14.1984 12.9651H10.9476L13.7794 5.89206C18.6302 6.4 20.9159 10.2222 19.5698 14.8444C18.1349 19.8095 12.3191 24 6.65556 24C6.60477 24 6.56667 24 6.52858 24Z'
          fill='#0F172B'
        />
      </g>
  </SvgIcon>
);

BoostyNeutral.displayName = 'BoostyNeutralIcon';
