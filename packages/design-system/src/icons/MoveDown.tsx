import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MoveDown: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M8 18L12 22L16 18'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M12 2V22'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

MoveDown.displayName = 'MoveDownIcon';
