import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const XExTwitter: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M18.3263 1.9039H21.6998L14.3297 10.3274L23 21.7899H16.2112L10.894 14.8379L4.80995 21.7899H1.43443L9.31743 12.78L1 1.9039H7.96111L12.7674 8.25823L18.3263 1.9039ZM17.1423 19.7707H19.0116L6.94539 3.81703H4.93946L17.1423 19.7707Z'
      fill='black'
    />
  </SvgIcon>
);

XExTwitter.displayName = 'XExTwitterIcon';
