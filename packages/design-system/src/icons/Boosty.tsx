import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Boosty: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M2.66154 14.3365L6.80122 0H13.1631L11.8806 4.44444C11.8679 4.46984 11.8552 4.49524 11.8425 4.52064L8.46472 16.254H11.6139C10.2933 19.5429 9.26472 22.1206 8.52821 23.9873C2.71234 23.9238 1.08694 19.7587 2.50916 14.8317M8.5536 24L16.2234 12.9651H12.9727L15.8044 5.89206C20.6552 6.4 22.9409 10.2222 21.5949 14.8444C20.16 19.8095 14.3441 24 8.68059 24C8.62979 24 8.5917 24 8.5536 24Z'
      fill='url(#boosty-paint0_linear_6830_376)'
    />
    <defs>
      <linearGradient
        id='boosty-paint0_linear_6830_376'
        x1='15.4587'
        y1='3.11721'
        x2='7.26938'
        y2='31.0449'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#EF7829' />
        <stop offset='0.0518954' stopColor='#F07529' />
        <stop offset='0.3551' stopColor='#F0672B' />
        <stop offset='0.6673' stopColor='#F15E2C' />
        <stop offset='1' stopColor='#F15A2C' />
      </linearGradient>
    </defs>
  </SvgIcon>
);

Boosty.displayName = 'BoostyIcon';
