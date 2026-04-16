import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ChevronFirst: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M6 18V6C6 5.44772 6.44772 5 7 5C7.55228 5 8 5.44772 8 6V18C8 18.5523 7.55228 19 7 19C6.44772 19 6 18.5523 6 18ZM16.293 5.29297C16.6835 4.90244 17.3165 4.90244 17.707 5.29297C18.0976 5.68349 18.0976 6.31651 17.707 6.70703L12.4141 12L17.707 17.293C18.0976 17.6835 18.0976 18.3165 17.707 18.707C17.3165 19.0976 16.6835 19.0976 16.293 18.707L10.293 12.707C9.90244 12.3165 9.90244 11.6835 10.293 11.293L16.293 5.29297Z'
      fill='currentColor'
    />
  </SvgIcon>
);

ChevronFirst.displayName = 'ChevronFirstIcon';
