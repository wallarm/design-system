import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Artstation: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(1.2041, 2.5)'>
        <path
          d='M21.5918 14.6735C21.5918 14.2449 21.4694 13.8367 21.2449 13.4898L14.1428 1.16327C13.7755 0.469388 13.0612 0 12.2245 0H8.46936L19.4285 18.9796L21.1632 15.9796C21.4898 15.4082 21.5918 15.1633 21.5918 14.6735Z'
          fill='#13AFF0'
        />
        <path
          d='M0 14.6531L1.81633 17.7959C2.18367 18.5102 2.91837 19 3.7551 19H15.8571L13.3469 14.6531H0Z'
          fill='#13AFF0'
        />
        <path d='M6.69386 3.08167L11.5714 11.5511H1.7959L6.69386 3.08167Z' fill='#13AFF0' />
      </g>
  </SvgIcon>
);

Artstation.displayName = 'ArtstationIcon';
