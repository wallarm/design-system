import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MailjetNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(0, 0.04605)'>
      <path
        d='M0 9.1867L8.75703 13.156L10.5166 11.4066L6.03581 9.37084L19.9284 4.05115L14.5882 17.8824L12.5627 13.4425L10.7928 15.202L10.8849 15.4067L14.7621 23.9079L24 0L0 9.1867Z'
        fill='currentColor'
      />
    </g>
  </SvgIcon>
);

MailjetNeutral.displayName = 'MailjetNeutralIcon';
