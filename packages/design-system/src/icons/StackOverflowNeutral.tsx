import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const StackOverflowNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(1.87035, 0)'>
      <path
        d='M14.966 17.0163L4.49015 14.8269L4.93357 12.7207L15.4094 14.9101L14.966 17.0163Z'
        fill='#0F172B'
      />
      <path
        d='M15.5757 14.3558L5.87584 9.83843L6.76269 7.87074L16.4625 12.4158L15.5757 14.3558Z'
        fill='#0F172B'
      />
      <path
        d='M16.7951 11.917L8.56409 5.07164L9.92207 3.43652L18.1531 10.2818L16.7951 11.917Z'
        fill='#0F172B'
      />
      <path
        d='M12.1669 1.27484L13.8852 0L20.2593 8.5913L18.5411 9.86614L12.1669 1.27484Z'
        fill='#0F172B'
      />
      <path d='M14.966 19.7046H4.26844V17.5706H14.966V19.7046Z' fill='#0F172B' />
      <path
        d='M17.1272 15.4364V21.866H2.13397V15.4364H0V24H19.2611V15.4364H17.1272Z'
        fill='#0F172B'
      />
    </g>
  </SvgIcon>
);

StackOverflowNeutral.displayName = 'StackOverflowNeutralIcon';
