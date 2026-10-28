import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Mailjet: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M0 9.23358L8.75703 13.2029L10.5166 11.4535L6.03581 9.41772L19.9284 4.09803L14.5882 17.9292L12.5627 13.4893L10.7928 15.2489L10.8849 15.4535L14.7621 23.9548L24 0.046875L0 9.23358Z'
      fill='#9585F4'
    />
  </SvgIcon>
);

Mailjet.displayName = 'MailjetIcon';
