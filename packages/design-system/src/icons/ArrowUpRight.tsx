import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ArrowUpRight: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M18 17C18 17.5523 17.5523 18 17 18C16.4477 18 16 17.5523 16 17V9.41406L7.70703 17.707C7.31651 18.0976 6.68349 18.0976 6.29297 17.707C5.90244 17.3165 5.90244 16.6835 6.29297 16.293L14.5859 8H7C6.44772 8 6 7.55228 6 7C6 6.44772 6.44772 6 7 6H17C17.5523 6 18 6.44772 18 7V17Z'
      fill='currentColor'
    />
  </SvgIcon>
);

ArrowUpRight.displayName = 'ArrowUpRightIcon';
