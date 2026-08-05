import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Sparkpost: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(6, 0)'>
      <path
        d='M10.0065 9.3465C8.7345 10.278 8.5065 11.9348 8.469 13.0515C6.47325 10.7813 12.1703 4.11525 5.6955 0C9.70275 5.08275 0 10.0912 0 17.5762C0 20.5185 1.8795 23.106 5.98125 24C10.0065 23.1623 12 20.5185 12 17.5762C12 13.182 9.20925 11.73 10.0065 9.3465ZM5.98125 21.5978C3.7785 21.5978 2.013 19.848 2.013 17.7067C2.013 15.5467 3.798 13.815 5.9805 13.815C8.18325 13.815 9.9495 15.5655 9.9495 17.7067C9.9495 19.848 8.18325 21.5978 5.98125 21.5978Z'
        fill='#FA6423'
      />
    </g>
  </SvgIcon>
);

Sparkpost.displayName = 'SparkpostIcon';
