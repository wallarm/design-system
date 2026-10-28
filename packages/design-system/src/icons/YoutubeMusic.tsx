import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const YoutubeMusic: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z'
      fill='#FF0000'
    />
    <path
      d='M12 6.27272C15.15 6.27272 17.7273 8.83636 17.7273 12C17.7273 15.1636 15.1637 17.7273 12 17.7273C8.83639 17.7273 6.27275 15.1636 6.27275 12C6.27275 8.83636 8.85002 6.27272 12 6.27272ZM12 5.72726C8.53639 5.72726 5.72729 8.53636 5.72729 12C5.72729 15.4636 8.53639 18.2727 12 18.2727C15.4637 18.2727 18.2727 15.4636 18.2727 12C18.2727 8.53636 15.4637 5.72726 12 5.72726Z'
      fill='white'
    />
    <path d='M9.81824 15.1364L15.1364 11.8636L9.81824 8.86365V15.1364Z' fill='white' />
  </SvgIcon>
);

YoutubeMusic.displayName = 'YoutubeMusicIcon';
