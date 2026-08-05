import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Gmail: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <>
      <g transform='translate(0, 7.640892)'>
        <path
          d='M1.63636 13.3636H5.45455V4.09091L0 0V11.7273C0 12.6327 0.733636 13.3636 1.63636 13.3636Z'
          fill='#4285F4'
        />
      </g>
      <g transform='translate(18.545454, 7.640892)'>
        <path
          d='M0 13.3636H3.81818C4.72364 13.3636 5.45455 12.63 5.45455 11.7273V0L0 4.09091'
          fill='#34A853'
        />
      </g>
      <g transform='translate(18.545454, 3)'>
        <path
          d='M0 1.64101V8.73192L5.45455 4.64101V2.45919C5.45455 0.435551 3.14455 -0.718085 1.52727 0.495551'
          fill='#FBBC04'
        />
      </g>
      <g transform='translate(5.454545, 4.640892)'>
        <path d='M0 7.09091V0L6.54545 4.90909L13.0909 0V7.09091L6.54545 12' fill='#EA4335' />
      </g>
      <g transform='translate(0, 3)'>
        <path
          d='M0 2.45919V4.64101L5.45455 8.73192V1.64101L3.92727 0.495551C2.30727 -0.718085 0 0.435551 0 2.45919'
          fill='#C5221F'
        />
      </g>
    </>
  </SvgIcon>
);

Gmail.displayName = 'GmailIcon';
