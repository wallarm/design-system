import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Figma: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <>
        <g transform='translate(4, 16)'>
          <path
            d='M4.00006 8.00006C6.20808 8.00006 8.00012 6.20803 8.00012 4.00003V0H4.00006C1.79205 0 0 1.79203 0 4.00003C0 6.20803 1.79205 8.00006 4.00006 8.00006Z'
            fill='#0ACF83'
          />
        </g>
        <g transform='translate(4, 8)'>
          <path
            d='M0 4.00003C0 1.79203 1.79205 0 4.00006 0H8.00012V7.99997H4.00006C1.79205 8.00006 0 6.20803 0 4.00003Z'
            fill='#A259FF'
          />
        </g>
        <g transform='translate(4, 0)'>
          <path
            d='M0 4.00003C0 1.79203 1.79205 0 4.00006 0H8.00012V7.99997H4.00006C1.79205 7.99997 0 6.20803 0 4.00003Z'
            fill='#F24E1E'
          />
        </g>
        <g transform='translate(12, 0)'>
          <path
            d='M0 0H4.00006C6.20808 0 8.00012 1.79203 8.00012 4.00003C8.00012 6.20803 6.20808 7.99997 4.00006 7.99997H0V0Z'
            fill='#FF7262'
          />
        </g>
        <g transform='translate(12, 8)'>
          <path
            d='M8.00012 4.00003C8.00012 6.20803 6.20808 8.00007 4.00006 8.00007C1.79205 8.00007 0 6.20803 0 4.00003C0 1.79203 1.79205 0 4.00006 0C6.20808 0 8.00012 1.79203 8.00012 4.00003Z'
            fill='#1ABCFE'
          />
        </g>
      </>
  </SvgIcon>
);

Figma.displayName = 'FigmaIcon';
