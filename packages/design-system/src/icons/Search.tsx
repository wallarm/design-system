import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Search: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M11 2C15.9706 2 20 6.02944 20 11C20 13.125 19.2619 15.0766 18.0303 16.6162L21.707 20.293C22.0974 20.6835 22.0975 21.3166 21.707 21.707C21.3166 22.0975 20.6835 22.0974 20.293 21.707L16.6162 18.0303C15.0766 19.2619 13.125 20 11 20C6.02944 20 2 15.9706 2 11C2 6.02944 6.02944 2 11 2ZM11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18C14.866 18 18 14.866 18 11C18 7.13401 14.866 4 11 4Z'
      fill='currentColor'
    />
  </SvgIcon>
);

Search.displayName = 'SearchIcon';
