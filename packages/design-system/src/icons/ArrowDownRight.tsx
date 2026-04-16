import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ArrowDownRight: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M6.29297 6.29297C6.68349 5.90244 7.31651 5.90244 7.70703 6.29297L16 14.5859V7C16 6.44772 16.4477 6 17 6C17.5523 6 18 6.44772 18 7V17C18 17.5523 17.5523 18 17 18H7C6.44772 18 6 17.5523 6 17C6 16.4477 6.44772 16 7 16H14.5859L6.29297 7.70703C5.90244 7.31651 5.90244 6.68349 6.29297 6.29297Z'
      fill='currentColor'
    />
  </SvgIcon>
);

ArrowDownRight.displayName = 'ArrowDownRightIcon';
