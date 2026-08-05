import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const TwitchNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(1.7143, 0)'>
      <path d='M16.2857 4.71429H14.5714V9.85715H16.2857V4.71429Z' fill='#0F172B' />
      <path d='M9.85709 4.71429H11.5714V9.85715H9.85709V4.71429Z' fill='#0F172B' />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M4.28571 0L0 4.28571V19.7143H5.14286V24L9.42857 19.7143H12.8571L20.5714 12V0H4.28571ZM18.8571 11.1429L15.4286 14.5714H12L9 17.5714V14.5714H5.14286V1.71429H18.8571V11.1429Z'
        fill='#0F172B'
      />
    </g>
  </SvgIcon>
);

TwitchNeutral.displayName = 'TwitchNeutralIcon';
