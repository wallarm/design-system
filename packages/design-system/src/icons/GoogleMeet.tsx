import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const GoogleMeet: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <>
        <g transform='translate(13.5768, 7.6656)'>
          <path
            d='M0 4.33467L2.33939 6.88371L5.48508 8.80006L6.03359 4.35036L5.48508 0L2.27905 1.68367L0 4.33467Z'
            fill='#00832D'
          />
        </g>
        <g transform='translate(0, 15.2688)'>
          <path
            d='M0 0.784319V4.57519C0 5.44187 0.736372 6.14383 1.64552 6.14383H5.62221L6.44497 3.27845L5.62221 0.784319L2.89338 0L0 0.784319Z'
            fill='#0066DA'
          />
        </g>
        <g transform='translate(0, 2.5872)'>
          <path
            d='M5.62221 0L0 5.35951L2.89338 6.14383L5.62221 5.35951L6.43126 2.89937L5.62221 0Z'
            fill='#E94235'
          />
        </g>
        <g transform='translate(0, 7.9488)'>
          <path d='M5.62221 0H0V8.10463H5.62221V0Z' fill='#2684FC' />
        </g>
        <g transform='translate(5.6232, 4.6776)'>
          <path
            d='M17.0312 0.179348L13.4384 2.98721V11.7873L17.0476 14.6082C17.5879 15.0108 18.3778 14.6435 18.3778 13.9886V0.785887C18.3778 0.123138 17.5701 -0.240263 17.0312 0.179348ZM7.95337 7.32188V11.3742H0V16.7337H11.7929C12.7021 16.7337 13.4384 16.0317 13.4384 15.1651V11.7873L7.95337 7.32188Z'
            fill='#00AC47'
          />
        </g>
        <g transform='translate(5.6232, 2.5872)'>
          <path
            d='M11.7929 0H0V5.35951H7.95337V9.41183L13.4385 5.07977V1.56864C13.4385 0.701965 12.7021 0 11.7929 0Z'
            fill='#FFBA00'
          />
        </g>
      </>
  </SvgIcon>
);

GoogleMeet.displayName = 'GoogleMeetIcon';
