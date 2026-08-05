import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Dzen: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <>
      <g transform='translate(0, 0)'>
        <circle cx='12' cy='12' r='12' fill='black' />
      </g>
      <g transform='translate(0, 0)'>
        <path
          d='M24 12.1286V11.8714C18.6857 11.7 16.26 11.5714 14.3143 9.68571C12.4286 7.74 12.2914 5.31429 12.1286 0H11.8714C11.7 5.31429 11.5714 7.74 9.68571 9.68571C7.74 11.5714 5.31429 11.7086 0 11.8714V12.1286C5.31429 12.3 7.74 12.4286 9.68571 14.3143C11.5714 16.26 11.7086 18.6857 11.8714 24H12.1286C12.3 18.6857 12.4286 16.26 14.3143 14.3143C16.26 12.4286 18.6857 12.2914 24 12.1286Z'
          fill='white'
        />
      </g>
    </>
  </SvgIcon>
);

Dzen.displayName = 'DzenIcon';
