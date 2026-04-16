import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ArrowDown: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M11 5C11 4.44772 11.4477 4 12 4C12.5523 4 13 4.44772 13 5V16.5859L18.293 11.293C18.6835 10.9024 19.3165 10.9024 19.707 11.293C20.0976 11.6835 20.0976 12.3165 19.707 12.707L12.707 19.707C12.3165 20.0976 11.6835 20.0976 11.293 19.707L4.29297 12.707C3.90245 12.3165 3.90245 11.6835 4.29297 11.293C4.68349 10.9024 5.31651 10.9024 5.70703 11.293L11 16.5859V5Z'
      fill='currentColor'
    />
  </SvgIcon>
);

ArrowDown.displayName = 'ArrowDownIcon';
