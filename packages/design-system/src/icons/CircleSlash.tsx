import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const CircleSlash: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12ZM14.293 8.29297C14.6835 7.90244 15.3165 7.90244 15.707 8.29297C16.0976 8.68349 16.0976 9.31651 15.707 9.70703L9.70703 15.707C9.31651 16.0976 8.68349 16.0976 8.29297 15.707C7.90244 15.3165 7.90244 14.6835 8.29297 14.293L14.293 8.29297ZM23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12Z'
      fill='currentColor'
    />
  </SvgIcon>
);

CircleSlash.displayName = 'CircleSlashIcon';
