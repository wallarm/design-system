import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Zulip: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(0, 0)'>
      <defs>
        <linearGradient
          id='provider-zulip-0-paint0_linear_0_3'
          x1='12'
          y1='0'
          x2='12'
          y2='24'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#24ADFF' />
          <stop offset='1' stopColor='#7B71FF' />
        </linearGradient>
      </defs>
      <path
        d='M12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0ZM11.4075 11.0833L7.1051 14.9251C6.66191 15.2738 6.37111 15.8494 6.37111 16.4969C6.37111 17.5543 7.14677 18.4195 8.09479 18.4195H16.1804C17.1284 18.4195 17.9041 17.5543 17.9041 16.4969C17.9041 15.4393 17.1284 14.5744 16.1804 14.5744H10.0593C9.96858 14.5744 9.91122 14.4656 9.95545 14.3772L11.5336 11.2175C11.5912 11.1253 11.4874 11.0148 11.4075 11.0833ZM16.1804 5.56526H8.09479C7.14677 5.56526 6.37111 6.43024 6.37111 7.48785C6.37111 8.54518 7.14677 9.41044 8.09479 9.41044H14.2159C14.3066 9.41044 14.364 9.51917 14.3197 9.60764L12.7416 12.7673C12.684 12.8595 12.7878 12.97 12.8677 12.9015L17.1701 9.05914C17.6133 8.71013 17.9041 8.1348 17.9041 7.48728C17.9041 6.42996 17.1284 5.56469 16.1804 5.56526Z'
        fill='url(#provider-zulip-0-paint0_linear_0_3)'
      />
    </g>
  </SvgIcon>
);

Zulip.displayName = 'ZulipIcon';
