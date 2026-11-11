import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const VkOnlySignNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M13.0718 19.4856C4.87192 19.4856 0.19489 13.8641 0 4.51001H4.10744C4.24236 11.3757 7.2704 14.2839 9.66887 14.8835V4.51001H13.5366V10.4313C15.9051 10.1764 18.3932 7.47815 19.2327 4.51001H23.1004C22.4558 8.16773 19.7575 10.866 17.8387 11.9753C19.7575 12.8747 22.8307 15.2283 24 19.4856H19.7425C18.8281 16.6374 16.5497 14.4338 13.5366 14.1339V19.4856H13.0718Z'
      fill='currentColor'
    />
  </SvgIcon>
);

VkOnlySignNeutral.displayName = 'VkOnlySignNeutralIcon';
