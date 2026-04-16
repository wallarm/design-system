import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ArrowLeft: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M11.293 4.29295C11.6835 3.90243 12.3165 3.90243 12.707 4.29295C13.0976 4.68348 13.0976 5.31649 12.707 5.70702L7.41406 11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H7.41406L12.707 18.293C13.0976 18.6835 13.0976 19.3165 12.707 19.707C12.3165 20.0975 11.6835 20.0975 11.293 19.707L4.29297 12.707C3.90245 12.3165 3.90245 11.6835 4.29297 11.293L11.293 4.29295Z'
      fill='currentColor'
    />
  </SvgIcon>
);

ArrowLeft.displayName = 'ArrowLeftIcon';
