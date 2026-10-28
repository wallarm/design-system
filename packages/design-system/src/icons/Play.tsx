import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Play: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M5 3.94338C5 2.31679 6.8384 1.37038 8.16211 2.31545L19.4424 10.3721C20.559 11.1697 20.559 12.8303 19.4424 13.6279L8.16211 21.6846C6.8384 22.6297 5 21.6832 5 20.0567V3.94338ZM7 20.0567L18.2793 12L7 3.94338V20.0567Z'
      fill='currentColor'
    />
  </SvgIcon>
);

Play.displayName = 'PlayIcon';
