import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const GitCommitHorizontal: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M12 8C13.8638 8 15.43 9.27477 15.874 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H15.874C15.43 14.7252 13.8638 16 12 16C10.1362 16 8.57002 14.7252 8.12598 13H3C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11H8.12598C8.57002 9.27477 10.1362 8 12 8ZM12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10Z'
      fill='currentColor'
    />
  </SvgIcon>
);

GitCommitHorizontal.displayName = 'GitCommitHorizontalIcon';
