import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Check: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="M18.9395 4.93946C19.5253 4.35368 20.4748 4.35368 21.0606 4.93946C21.6462 5.52526 21.6463 6.47482 21.0606 7.06056L10.0606 18.0606C9.47485 18.6463 8.52529 18.6462 7.93949 18.0606L2.93949 13.0606C2.3537 12.4748 2.3537 11.5253 2.93949 10.9395C3.52528 10.3537 4.4748 10.3537 5.06058 10.9395L9.00004 14.8789L18.9395 4.93946Z"
      fill="currentColor"
    />
  </SvgIcon>
);

Check.displayName = 'CheckIcon';
