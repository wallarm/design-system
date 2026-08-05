import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const TinderNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(3.5, 2)'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M5.07402 8.06597C8.88709 6.74992 9.53612 3.3217 9.04935 0.169695C9.04935 0.0559627 9.1467 -0.0252747 9.24406 0.00722027C12.8949 1.79444 17 5.69384 17 11.5429C17 16.0272 13.5277 19.9916 8.48144 19.9916C6.6808 20.0736 4.90417 19.5528 3.43195 18.5114C1.95974 17.47 0.875795 15.9674 0.351198 14.2406C-0.1734 12.5138 -0.10877 10.6613 0.534885 8.97536C1.17854 7.28945 2.36456 5.86618 3.90576 4.9302C4.00312 4.86521 4.13292 4.9302 4.13292 5.04394C4.1816 5.64509 4.34386 7.15611 5.00912 8.06597H5.07402Z'
        fill='#0F172B'
      />
    </g>
  </SvgIcon>
);

TinderNeutral.displayName = 'TinderNeutralIcon';
