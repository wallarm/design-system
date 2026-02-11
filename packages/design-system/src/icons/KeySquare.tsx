import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const KeySquare: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M12.4 2.7a2.5 2.5 0 0 1 3.4 0l3.5 3.5a2.5 2.5 0 0 1 0 3.4L8.7 20.2a2.5 2.5 0 0 1-3.4 0l-3.5-3.5a2.5 2.5 0 0 1 0-3.4Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='m14 7 3 3'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M9.2 9.2 8.5 8.5'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <path
      d='M11.2 11.2 10.5 10.5'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

KeySquare.displayName = 'KeySquareIcon';
