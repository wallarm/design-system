import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const YoutubeMusic: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <>
      <g transform='translate(0, 0)'>
        <path
          d='M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z'
          fill='#FF0000'
        />
      </g>
      <g transform='translate(5.727273, 5.727273)'>
        <path
          d='M6.27273 0.545455C9.42273 0.545455 12 3.10909 12 6.27273C12 9.43636 9.43636 12 6.27273 12C3.10909 12 0.545455 9.43636 0.545455 6.27273C0.545455 3.10909 3.12273 0.545455 6.27273 0.545455ZM6.27273 0C2.80909 0 0 2.80909 0 6.27273C0 9.73636 2.80909 12.5455 6.27273 12.5455C9.73636 12.5455 12.5455 9.73636 12.5455 6.27273C12.5455 2.80909 9.73636 0 6.27273 0Z'
          fill='white'
        />
      </g>
      <g transform='translate(9.818182, 8.863636)'>
        <path d='M0 6.27273L5.31818 3L0 0V6.27273Z' fill='white' />
      </g>
    </>
  </SvgIcon>
);

YoutubeMusic.displayName = 'YoutubeMusicIcon';
