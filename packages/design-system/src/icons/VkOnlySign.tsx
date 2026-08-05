import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const VkOnlySign: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(0, 4.5122)'>
        <path
          d='M13.0718 14.9756C4.87193 14.9756 0.19489 9.35414 0 0H4.10744C4.24236 6.86569 7.2704 9.77385 9.66887 10.3735V0H13.5366V5.92124C15.9051 5.66641 18.3932 2.96814 19.2327 0H23.1004C22.4558 3.65772 19.7575 6.35599 17.8387 7.46529C19.7575 8.36472 22.8307 10.7183 24 14.9756H19.7425C18.8281 12.1274 16.5497 9.92377 13.5366 9.62393V14.9756H13.0718Z'
          fill='#0077FF'
        />
      </g>
  </SvgIcon>
);

VkOnlySign.displayName = 'VkOnlySignIcon';
