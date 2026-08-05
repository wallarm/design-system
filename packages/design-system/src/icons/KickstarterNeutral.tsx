import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const KickstarterNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(1.4737, 0.11545)'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M17.2123 11.8901L19.3735 9.74324C21.6123 7.51937 21.6123 3.8973 19.3735 1.67341C17.1347 -0.550467 13.4883 -0.550467 11.2495 1.67341L10.4626 2.45508C9.42076 0.968821 7.70286 0 5.74114 0C2.57131 0 0 2.55416 0 5.70282V18.0663C0 21.2149 2.57131 23.7691 5.74114 23.7691C7.70286 23.7691 9.42076 22.8003 10.4626 21.314L11.2495 22.0957C13.4883 24.3196 17.1347 24.3196 19.3735 22.0957C21.6123 19.8718 21.6123 16.2497 19.3735 14.0259L17.2123 11.8901Z'
          fill='#0F172B'
        />
      </g>
  </SvgIcon>
);

KickstarterNeutral.displayName = 'KickstarterNeutralIcon';
