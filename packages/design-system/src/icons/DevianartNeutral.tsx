import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const DevianartNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(4.5517, 0)'>
      <path
        d='M14.8966 4.13794V0H10.3448L10.0966 0.455156L8.02763 3.72412L7.36551 4.5517H0V10.7586H4.13794L4.55175 11.2138L0 19.6138V24H4.55175L4.8 23.5448L7.03448 19.6138L7.4483 19.0345H14.8966V13.2414H10.7587L10.3448 12.8276L14.8966 4.13794Z'
        fill='#0F172B'
      />
    </g>
  </SvgIcon>
);

DevianartNeutral.displayName = 'DevianartNeutralIcon';
