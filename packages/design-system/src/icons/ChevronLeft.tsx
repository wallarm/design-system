import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ChevronLeft: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M14.293 5.29295C14.6835 4.90243 15.3165 4.90243 15.707 5.29295C16.0975 5.68348 16.0975 6.31649 15.707 6.70702L10.414 12L15.707 17.293C16.0975 17.6835 16.0975 18.3165 15.707 18.707C15.3165 19.0975 14.6835 19.0975 14.293 18.707L8.29295 12.707C7.90243 12.3165 7.90243 11.6835 8.29295 11.293L14.293 5.29295Z'
      fill='currentColor'
    />
  </SvgIcon>
);

ChevronLeft.displayName = 'ChevronLeftIcon';
