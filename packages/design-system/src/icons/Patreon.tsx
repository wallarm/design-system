import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Patreon: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M22.9566 7.21C22.9524 4.14555 20.5658 1.634 17.7655 0.727776C14.2882 -0.397558 9.70198 -0.234446 6.38154 1.33222C2.35709 3.23133 1.09287 7.39133 1.04576 11.5402C1.00709 14.9513 1.34754 23.9356 6.41509 23.9996C10.1804 24.0473 10.7411 19.1956 12.4833 16.8589C13.7229 15.1964 15.3189 14.7269 17.2835 14.2407C20.6602 13.4049 22.9615 10.74 22.9566 7.21Z'
      fill='black'
    />
  </SvgIcon>
);

Patreon.displayName = 'PatreonIcon';
