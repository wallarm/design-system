import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const YoutubeShortsNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M14.7404 0.529285C17.0041 -0.650402 19.8068 0.208973 20.9982 2.44921C22.1896 4.68944 21.3205 7.46093 19.0568 8.64061L17.1955 9.61913C18.799 9.67772 20.3283 10.5586 21.1291 12.0644C22.3205 14.3047 21.4533 17.0762 19.1877 18.2558L9.26189 23.4707C6.99822 24.6504 4.19549 23.791 3.00408 21.5508C1.81268 19.3105 2.68182 16.5391 4.94549 15.3594L6.80682 14.3808C5.2033 14.3223 3.67401 13.4414 2.87322 11.9355C1.68182 9.6953 2.55096 6.92382 4.81463 5.74413L14.7404 0.529285ZM9.38299 8.30663L15.3908 12.0156L9.38299 15.707V8.30663Z'
      fill='currentColor'
    />
  </SvgIcon>
);

YoutubeShortsNeutral.displayName = 'YoutubeShortsNeutralIcon';
