import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Check: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M19.293 5.29295C19.6835 4.90243 20.3165 4.90243 20.707 5.29295C21.0975 5.68348 21.0975 6.31649 20.707 6.70702L9.70702 17.707C9.31649 18.0975 8.68348 18.0975 8.29295 17.707L3.29295 12.707C2.90243 12.3165 2.90243 11.6835 3.29295 11.293C3.68348 10.9024 4.31649 10.9024 4.70702 11.293L8.99999 15.5859L19.293 5.29295Z'
      fill='currentColor'
    />
  </SvgIcon>
);

Check.displayName = 'CheckIcon';
