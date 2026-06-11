import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Video: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5' />
    <rect x='2' y='6' width='14' height='12' rx='2' />
  </SvgIcon>
);

Video.displayName = 'VideoIcon';
