import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Mouse: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9V15C6 18.3137 8.68629 21 12 21C15.3137 21 18 18.3137 18 15V9ZM11 10V6C11 5.44772 11.4477 5 12 5C12.5523 5 13 5.44772 13 6V10C13 10.5523 12.5523 11 12 11C11.4477 11 11 10.5523 11 10ZM20 15C20 19.4183 16.4183 23 12 23C7.58172 23 4 19.4183 4 15V9C4 4.58172 7.58172 1 12 1C16.4183 1 20 4.58172 20 9V15Z'
      fill='currentColor'
    />
  </SvgIcon>
);

Mouse.displayName = 'MouseIcon';
