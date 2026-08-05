import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Twitch: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <>
      <g transform='translate(1.715, 0)'>
        <path
          d='M4.28571 0L0 4.28571V19.7143H5.14286V24L9.42857 19.7143H12.8571L20.5714 12V0H4.28571ZM18.8571 11.1429L15.4286 14.5714H12L9 17.5714V14.5714H5.14286V1.71429H18.8571V11.1429Z'
          fill='#9146FF'
        />
      </g>
      <g transform='translate(6.857857, 1.714278)'>
        <path
          d='M13.7143 9.42858L10.2857 12.8571H6.85714L3.85714 15.8572V12.8571H0V0H13.7143V9.42858Z'
          fill='white'
        />
      </g>
      <g transform='translate(16.286428, 4.714286)'>
        <path d='M1.71429 0H0V5.14286H1.71429V0Z' fill='#9146FF' />
      </g>
      <g transform='translate(11.57209, 4.714294)'>
        <path d='M1.71429 0H0V5.14286H1.71429V0Z' fill='#9146FF' />
      </g>
    </>
  </SvgIcon>
);

Twitch.displayName = 'TwitchIcon';
