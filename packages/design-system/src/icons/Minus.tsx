import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Minus: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M19 11C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H5C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11H19Z'
      fill='currentColor'
    />
  </SvgIcon>
);

Minus.displayName = 'MinusIcon';
