import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ArrowRight: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M11.293 4.29295C11.6835 3.90243 12.3165 3.90243 12.707 4.29295L19.707 11.293C20.0976 11.6835 20.0976 12.3165 19.707 12.707L12.707 19.707C12.3165 20.0975 11.6835 20.0975 11.293 19.707C10.9024 19.3165 10.9024 18.6835 11.293 18.293L16.5859 13H5C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11H16.5859L11.293 5.70702C10.9024 5.31649 10.9024 4.68348 11.293 4.29295Z'
      fill='currentColor'
    />
  </SvgIcon>
);

ArrowRight.displayName = 'ArrowRightIcon';
