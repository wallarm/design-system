import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const StackOverflowNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M16.966 17.0163L6.49015 14.8269L6.93357 12.7207L17.4094 14.9101L16.966 17.0163Z'
      fill='currentColor'
    />
    <path
      d='M17.5757 14.3558L7.87584 9.83843L8.76269 7.87074L18.4625 12.4158L17.5757 14.3558Z'
      fill='currentColor'
    />
    <path
      d='M18.7951 11.917L10.5641 5.07164L11.9221 3.43652L20.1531 10.2818L18.7951 11.917Z'
      fill='currentColor'
    />
    <path
      d='M14.1669 1.27484L15.8852 0L22.2593 8.5913L20.5411 9.86614L14.1669 1.27484Z'
      fill='currentColor'
    />
    <path d='M16.966 19.7046H6.26844V17.5706H16.966V19.7046Z' fill='currentColor' />
    <path
      d='M19.1272 15.4364V21.866H4.13397V15.4364H2V24H21.2611V15.4364H19.1272Z'
      fill='currentColor'
    />
  </SvgIcon>
);

StackOverflowNeutral.displayName = 'StackOverflowNeutralIcon';
