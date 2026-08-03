import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Collapse: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(3, 3)'>
      <path
        d='M17 0C17.5523 0 18 0.447715 18 1V17C18 17.5523 17.5523 18 17 18H1C0.447715 18 0 17.5523 0 17V1C0 0.447715 0.447715 0 1 0H17ZM2 16H16V2H2V16ZM10.0049 8H14V10H10.0049H8.00488H4V8H8.00488H10.0049Z'
        fill='currentColor'
      />
    </g>
  </SvgIcon>
);

Collapse.displayName = 'CollapseIcon';
