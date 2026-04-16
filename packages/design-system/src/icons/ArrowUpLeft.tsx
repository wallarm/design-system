import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ArrowUpLeft: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M6 17V7C6 6.44772 6.44772 6 7 6H17C17.5523 6 18 6.44772 18 7C18 7.55228 17.5523 8 17 8H9.41406L17.707 16.293C18.0976 16.6835 18.0976 17.3165 17.707 17.707C17.3165 18.0976 16.6835 18.0976 16.293 17.707L8 9.41406V17C8 17.5523 7.55228 18 7 18C6.44772 18 6 17.5523 6 17Z'
      fill='currentColor'
    />
  </SvgIcon>
);

ArrowUpLeft.displayName = 'ArrowUpLeftIcon';
