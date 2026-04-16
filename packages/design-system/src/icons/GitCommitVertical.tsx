import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const GitCommitVertical: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12ZM16 12C16 13.8638 14.7252 15.43 13 15.874V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V15.874C9.27477 15.43 8 13.8638 8 12C8 10.1362 9.27477 8.57002 11 8.12598V3C11 2.44772 11.4477 2 12 2C12.5523 2 13 2.44772 13 3V8.12598C14.7252 8.57002 16 10.1362 16 12Z'
      fill='currentColor'
    />
  </SvgIcon>
);

GitCommitVertical.displayName = 'GitCommitVerticalIcon';
