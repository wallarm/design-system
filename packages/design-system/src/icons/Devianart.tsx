import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Devianart: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M19.4466 4.13794V0H14.8949L14.6466 0.455156L12.5777 3.72412L11.9156 4.5517H4.55005V10.7586H8.68799L9.1018 11.2138L4.55005 19.6138V24H9.1018L9.35005 23.5448L11.5845 19.6138L11.9983 19.0345H19.4466V13.2414H15.3087L14.8949 12.8276L19.4466 4.13794Z'
      fill='#00D159'
    />
  </SvgIcon>
);

Devianart.displayName = 'DevianartIcon';
