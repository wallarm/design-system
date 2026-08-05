import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const YoutubeShortsNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(2.3379, 0.00025)'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12.4012 0.529041C14.6648 -0.650646 17.4676 0.208729 18.659 2.44896C19.8504 4.6892 18.9812 7.46068 16.7176 8.64037L14.8562 9.61889C16.4598 9.67748 17.9891 10.5583 18.7898 12.0642C19.9812 14.3044 19.1141 17.0759 16.8484 18.2556L6.92266 23.4704C4.65899 24.6501 1.85626 23.7908 0.66485 21.5505C-0.526555 19.3103 0.342585 16.5388 2.60626 15.3591L4.46758 14.3806C2.86407 14.322 1.33477 13.4412 0.533991 11.9353C-0.657415 9.69506 0.211726 6.92357 2.4754 5.74388L12.4012 0.529041ZM7.04375 8.30639L13.0516 12.0154L7.04375 15.7068V8.30639Z'
        fill='#0F172B'
      />
    </g>
  </SvgIcon>
);

YoutubeShortsNeutral.displayName = 'YoutubeShortsNeutralIcon';
