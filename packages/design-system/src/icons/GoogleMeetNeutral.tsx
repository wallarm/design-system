import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const GoogleMeetNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(0, 2.5881)'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M5.62221 0L0 5.35951V17.2549C0 18.1216 0.736372 18.8236 1.64552 18.8236L17.4152 18.8238C18.3243 18.8238 19.0607 18.1218 19.0607 17.2552V13.8774L22.6699 16.6983C23.2102 17.1009 24 16.7336 24 16.0787V2.87598C24 2.21323 23.1923 1.84982 22.6534 2.26944L19.0607 5.0773L19.0607 1.56864C19.0607 0.701965 18.3243 0 17.4152 0H5.62221ZM5.62225 5.35938L5.62221 13.4641L13.5756 13.4643V9.41197L13.5756 5.35951L5.62225 5.35938Z'
        fill='#0F172B'
      />
    </g>
  </SvgIcon>
);

GoogleMeetNeutral.displayName = 'GoogleMeetNeutralIcon';
