import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ChevronRight: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M8.29295 5.29295C8.68348 4.90243 9.31649 4.90243 9.70702 5.29295L15.707 11.293C16.0975 11.6835 16.0975 12.3165 15.707 12.707L9.70702 18.707C9.31649 19.0975 8.68348 19.0975 8.29295 18.707C7.90243 18.3165 7.90243 17.6835 8.29295 17.293L13.5859 12L8.29295 6.70702C7.90243 6.31649 7.90243 5.68348 8.29295 5.29295Z'
      fill='currentColor'
    />
  </SvgIcon>
);

ChevronRight.displayName = 'ChevronRightIcon';
