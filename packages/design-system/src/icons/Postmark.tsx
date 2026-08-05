import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Postmark: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <>
      <g transform='translate(0.15, 0.15)'>
        <path
          d='M20.25 0.15H3.75C1.76177 0.15 0.15 1.76177 0.15 3.75V20.25C0.15 22.2382 1.76177 23.85 3.75 23.85H20.25C22.2382 23.85 23.85 22.2382 23.85 20.25V3.75C23.85 1.76177 22.2382 0.15 20.25 0.15Z'
          fill='#FEDD00'
          stroke='#D9B500'
          strokeWidth='0.3'
        />
      </g>
      <g transform='translate(6, 3.8175)'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M1.9605 13.7183V1.96125H0V0H6.951C11.2935 0 12.1935 2.8635 12.1935 4.8495C12.1935 6.44325 11.547 7.66725 10.8773 8.337C9.792 9.42225 8.31375 9.67575 6.0735 9.67575H4.3185V13.7175H6.3735V15.678H0V13.7175H1.9605V13.7183ZM4.3155 7.7835H6.276C9.1635 7.7835 9.786 6.444 9.786 4.827C9.786 2.97975 8.74725 1.9635 7.0155 1.9635H4.3185L4.31625 7.7835H4.3155Z'
          fill='black'
        />
      </g>
    </>
  </SvgIcon>
);

Postmark.displayName = 'PostmarkIcon';
