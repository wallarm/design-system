import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const YoutubeMusicNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(0, 0)'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 6.27273C15.15 6.27273 17.7273 8.83636 17.7273 12C17.7273 15.1636 15.1637 17.7273 12 17.7273C8.83639 17.7273 6.27275 15.1636 6.27275 12C6.27275 8.83636 8.85002 6.27273 12 6.27273ZM9.81818 15.1364L15.1364 11.8636L9.81818 8.86364V15.1364Z'
        fill='#0F172B'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12ZM12 5.72727C8.53639 5.72727 5.72729 8.53636 5.72729 12C5.72729 15.4636 8.53639 18.2727 12 18.2727C15.4637 18.2727 18.2728 15.4636 18.2728 12C18.2728 8.53636 15.4637 5.72727 12 5.72727Z'
        fill='#0F172B'
      />
    </g>
  </SvgIcon>
);

YoutubeMusicNeutral.displayName = 'YoutubeMusicNeutralIcon';
