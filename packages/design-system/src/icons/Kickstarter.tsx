import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Kickstarter: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M18.6859 12.1401L20.8471 9.99324C23.086 7.76937 23.086 4.1473 20.8471 1.92341C18.6083 -0.300467 14.9619 -0.300467 12.7231 1.92341L11.9362 2.70508C10.8944 1.21882 9.1765 0.25 7.21477 0.25C4.04495 0.25 1.47363 2.80416 1.47363 5.95282V18.3163C1.47363 21.4649 4.04495 24.0191 7.21477 24.0191C9.1765 24.0191 10.8944 23.0503 11.9362 21.564L12.7231 22.3457C14.9619 24.5696 18.6083 24.5696 20.8471 22.3457C23.086 20.1218 23.086 16.4997 20.8471 14.2759L18.6859 12.1401Z'
      fill='#05CE78'
    />
  </SvgIcon>
);

Kickstarter.displayName = 'KickstarterIcon';
