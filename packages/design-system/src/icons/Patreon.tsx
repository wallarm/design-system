import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Patreon: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(1.0433, 0)'>
      <path
        d='M21.9134 7.21006C21.9092 4.14562 19.5225 1.63406 16.7223 0.727837C13.245 -0.397497 8.65877 -0.234385 5.33832 1.33228C1.31388 3.23139 0.0496557 7.39139 0.00254457 11.5403C-0.0361221 14.9514 0.304322 23.9356 5.37188 23.9996C9.13721 24.0474 9.69788 19.1956 11.4401 16.8589C12.6797 15.1965 14.2757 14.7269 16.2403 14.2407C19.617 13.4049 21.9183 10.7401 21.9134 7.21006Z'
        fill='black'
      />
    </g>
  </SvgIcon>
);

Patreon.displayName = 'PatreonIcon';
