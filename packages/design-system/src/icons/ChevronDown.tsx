import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ChevronDown: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M17.293 8.29295C17.6835 7.90243 18.3165 7.90243 18.707 8.29295C19.0975 8.68348 19.0975 9.31649 18.707 9.70702L12.707 15.707C12.3165 16.0975 11.6835 16.0975 11.293 15.707L5.29295 9.70702C4.90243 9.31649 4.90243 8.68348 5.29295 8.29295C5.68348 7.90243 6.31649 7.90243 6.70702 8.29295L12 13.5859L17.293 8.29295Z'
      fill='currentColor'
    />
  </SvgIcon>
);

ChevronDown.displayName = 'ChevronDownIcon';
