import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Artstation: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M22.7968 17.1735C22.7968 16.7449 22.6743 16.3367 22.4498 15.9898L15.3478 3.66327C14.9804 2.96939 14.2662 2.5 13.4294 2.5H9.67432L20.6335 21.4796L22.3682 18.4796C22.6947 17.9082 22.7968 17.6633 22.7968 17.1735Z'
      fill='#13AFF0'
    />
    <path
      d='M1.20496 17.1531L3.02128 20.2959C3.38863 21.0102 4.12332 21.5 4.96006 21.5H17.0621L14.5519 17.1531H1.20496Z'
      fill='#13AFF0'
    />
    <path d='M7.89881 5.58167L12.7764 14.0511H3.00085L7.89881 5.58167Z' fill='#13AFF0' />
  </SvgIcon>
);

Artstation.displayName = 'ArtstationIcon';
