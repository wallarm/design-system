import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Bot: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M12 8V4H8' />
    <rect width='16' height='12' x='4' y='8' rx='2' />
    <path d='M2 14h2' />
    <path d='M20 14h2' />
    <path d='M15 13v2' />
    <path d='M9 13v2' />
  </SvgIcon>
);

Bot.displayName = 'BotIcon';
