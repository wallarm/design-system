import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MessageSquareDot: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M12.7 3H4a2 2 0 0 0-2 2v16.286a.71.71 0 0 0 1.212.502l2.202-2.202A2 2 0 0 1 6.828 19H20a2 2 0 0 0 2-2v-4.7' />
    <circle cx='19' cy='6' r='3' />
  </SvgIcon>
);

MessageSquareDot.displayName = 'MessageSquareDotIcon';
