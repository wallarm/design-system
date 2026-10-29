import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Twitch: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M20.5722 11.1428L17.1436 14.5714H13.7151L10.7151 17.5714V14.5714H6.85791V1.71426H20.5722V11.1428Z'
      fill='white'
    />
    <path
      d='M6.00068 0L1.71497 4.28571V19.7143H6.85782V24L11.1435 19.7143H14.5721L22.2864 12V0H6.00068ZM20.5721 11.1429L17.1435 14.5714H13.715L10.715 17.5714V14.5714H6.85782V1.71429H20.5721V11.1429Z'
      fill='#9146FF'
    />
    <path d='M18.0007 4.71429H16.2864V9.85715H18.0007V4.71429Z' fill='#9146FF' />
    <path d='M13.2864 4.71429H11.5721V9.85715H13.2864V4.71429Z' fill='#9146FF' />
  </SvgIcon>
);

Twitch.displayName = 'TwitchIcon';
