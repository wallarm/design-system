import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const GoogleMeetNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M5.62221 2.58813L0 7.94765V19.8431C0 20.7097 0.736372 21.4117 1.64552 21.4117L17.4152 21.4119C18.3243 21.4119 19.0607 20.71 19.0607 19.8433V16.4655L22.6699 19.2864C23.2102 19.689 24 19.3217 24 18.6668V5.46411C24 4.80136 23.1923 4.43796 22.6534 4.85757L19.0607 7.66543L19.0607 4.15677C19.0607 3.2901 18.3243 2.58813 17.4152 2.58813H5.62221ZM5.62225 7.94751L5.62221 16.0522L13.5756 16.0524V12.0001L13.5756 7.94765L5.62225 7.94751Z'
      fill='currentColor'
    />
  </SvgIcon>
);

GoogleMeetNeutral.displayName = 'GoogleMeetNeutralIcon';
