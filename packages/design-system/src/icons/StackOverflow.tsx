import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const StackOverflow: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <>
        <g transform='translate(1.999998, 15.436412)'>
          <path
            d='M17.1272 6.42962V0H19.2611V8.56359H0V0H2.13397V6.42962H17.1272Z'
            fill='#BCBBBB'
          />
        </g>
        <g transform='translate(6.268436, 0)'>
          <path
            d='M0.221711 14.8269L10.6976 17.0163L11.141 14.9101L0.665134 12.7207L0.221711 14.8269V14.8269ZM1.6074 9.83843L11.3073 14.3558L12.1941 12.4158L2.49425 7.87074L1.6074 9.83843ZM4.29565 5.07164L12.5267 11.917L13.8847 10.2818L5.65363 3.43652L4.29565 5.07164V5.07164ZM9.61672 0L7.89846 1.27484L14.2726 9.86614L15.9909 8.5913L9.61672 0V0ZM0 19.7046H10.6976V17.5706H0V19.7046Z'
            fill='#F48023'
          />
        </g>
      </>
  </SvgIcon>
);

StackOverflow.displayName = 'StackOverflowIcon';
