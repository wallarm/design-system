import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ResendNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(0, 0)'>
      <path
        d='M14.679 0C19.327 0 22.092 2.765 22.092 6.434C22.092 10.103 19.327 12.868 14.679 12.868H12.33L24 24H15.755L6.875 15.56C6.239 14.972 5.945 14.287 5.945 13.7C5.945 12.869 6.532 12.135 7.658 11.817L12.232 10.593C13.969 10.128 15.168 8.783 15.168 7.021C15.168 4.868 13.407 3.621 11.229 3.621H0V0H14.679Z'
        fill='currentColor'
      />
    </g>
  </SvgIcon>
);

ResendNeutral.displayName = 'ResendNeutralIcon';
