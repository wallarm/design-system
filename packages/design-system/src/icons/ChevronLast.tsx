import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ChevronLast: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M6.29295 5.29297C6.68348 4.90244 7.31649 4.90244 7.70702 5.29297L13.707 11.293C14.0975 11.6835 14.0975 12.3165 13.707 12.707L7.70702 18.707C7.31649 19.0976 6.68348 19.0976 6.29295 18.707C5.90243 18.3165 5.90243 17.6835 6.29295 17.293L11.5859 12L6.29295 6.70703C5.90243 6.31651 5.90243 5.68349 6.29295 5.29297ZM16 18V6C16 5.44772 16.4477 5 17 5C17.5523 5 18 5.44772 18 6V18C18 18.5523 17.5523 19 17 19C16.4477 19 16 18.5523 16 18Z'
      fill='currentColor'
    />
  </SvgIcon>
);

ChevronLast.displayName = 'ChevronLastIcon';
