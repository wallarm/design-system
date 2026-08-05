import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const TelegramOnlySign: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(1, 2.8839)'>
        <defs>
          <linearGradient
            id='telegram-only-sign-original-0-paint0_linear_0_3'
            x1='1100'
            y1='0'
            x2='1100'
            y2='1809.7'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='#2AABEE' />
            <stop offset='1' stopColor='#229ED9' />
          </linearGradient>
        </defs>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M1.51239 7.84883C7.41795 5.27585 11.3559 3.57959 13.3263 2.76003C18.9521 0.420046 20.1211 0.0135654 20.883 0.000143111C21.0506 -0.00280896 21.4253 0.0387227 21.668 0.235669C21.873 0.401967 21.9294 0.626612 21.9563 0.78428C21.9833 0.941949 22.0169 1.30112 21.9902 1.58177C21.6854 4.78503 20.3662 12.5585 19.6951 16.1462C19.4111 17.6643 18.852 18.1733 18.3107 18.2231C17.1343 18.3314 16.2409 17.4457 15.1015 16.6988C13.3186 15.53 12.3113 14.8025 10.5807 13.662C8.58058 12.3439 9.87715 11.6195 11.017 10.4356C11.3153 10.1258 16.4986 5.41117 16.5989 4.98348C16.6115 4.92999 16.6231 4.7306 16.5046 4.62532C16.3862 4.52004 16.2114 4.55604 16.0852 4.58467C15.9064 4.62526 13.0581 6.50789 7.54035 10.2326C6.73187 10.7877 5.99958 11.0582 5.34347 11.044C4.62016 11.0284 3.2288 10.6351 2.19447 10.2988C0.925826 9.88646 -0.0824703 9.66842 0.00532971 8.96806C0.0510613 8.60326 0.553413 8.23019 1.51239 7.84883Z'
          fill='url(#telegram-only-sign-original-0-paint0_linear_0_3)'
        />
      </g>
  </SvgIcon>
);

TelegramOnlySign.displayName = 'TelegramOnlySignIcon';
