import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Pencil: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M17.5 2.5a2.83 2.83 0 1 1 4 4L12 16l-4 1 1-4 9.5-9.5z'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </SvgIcon>
);

Pencil.displayName = 'PencilIcon';
