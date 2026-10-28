import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Tinder: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M8.57402 10.066C12.3871 8.74992 13.0361 5.3217 12.5493 2.1697C12.5493 2.05596 12.6467 1.97473 12.7441 2.00722C16.3949 3.79444 20.5 7.69384 20.5 13.5429C20.5 18.0272 17.0277 21.9916 11.9814 21.9916C10.1808 22.0736 8.40417 21.5528 6.93195 20.5114C5.45974 19.47 4.3758 17.9674 3.8512 16.2406C3.3266 14.5138 3.39123 12.6613 4.03488 10.9754C4.67854 9.28945 5.86456 7.86618 7.40576 6.9302C7.50312 6.86521 7.63292 6.9302 7.63292 7.04394C7.6816 7.64509 7.84386 9.15611 8.50912 10.066H8.57402Z'
      fill='url(#tinder-paint0_radial_6830_409)'
    />
    <defs>
      <radialGradient
        id='tinder-paint0_radial_6830_409'
        cx='0'
        cy='0'
        r='1'
        gradientUnits='userSpaceOnUse'
        gradientTransform='translate(12 22) scale(17 20)'
      >
        <stop stopColor='#FF7854' />
        <stop offset='1' stopColor='#FD267D' />
      </radialGradient>
    </defs>
  </SvgIcon>
);

Tinder.displayName = 'TinderIcon';
