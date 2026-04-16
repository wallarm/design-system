import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ArrowDownLeft: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M16.293 6.29297C16.6835 5.90244 17.3165 5.90244 17.707 6.29297C18.0976 6.68349 18.0976 7.31651 17.707 7.70703L9.41406 16H17C17.5523 16 18 16.4477 18 17C18 17.5523 17.5523 18 17 18H7C6.44772 18 6 17.5523 6 17V7C6 6.44772 6.44772 6 7 6C7.55228 6 8 6.44772 8 7V14.5859L16.293 6.29297Z'
      fill='currentColor'
    />
  </SvgIcon>
);

ArrowDownLeft.displayName = 'ArrowDownLeftIcon';
