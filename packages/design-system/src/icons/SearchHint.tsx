import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const SearchHint: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <rect width='18' height='18' x='3' y='3' rx='2' />
    <line x1='9' x2='15' y1='15' y2='9' />
  </SvgIcon>
);

SearchHint.displayName = 'SearchHintIcon';
