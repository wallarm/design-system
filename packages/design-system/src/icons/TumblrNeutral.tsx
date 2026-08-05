import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const TumblrNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(5.2, 0)'>
        <path
          d='M9.6 24C6 24 3.3 22.15 3.3 17.7V10.6H0V6.75C3.6 5.8 5.1 2.7 5.3 0H9.05V6.1H13.4V10.6H9.05V16.8C9.05 18.65 10 19.3 11.5 19.3H13.6V24H9.6Z'
          fill='#0F172B'
        />
      </g>
  </SvgIcon>
);

TumblrNeutral.displayName = 'TumblrNeutralIcon';
