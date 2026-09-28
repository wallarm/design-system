import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MicrosoftNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path d='M2 2H11.5238V11.5238H2V2Z' fill='currentColor' />
    <path d='M12.4762 2H22V11.5238H12.4762V2Z' fill='currentColor' />
    <path d='M2 12.4762H11.5238V22H2V12.4762Z' fill='currentColor' />
    <path d='M12.4762 12.4762H22V22H12.4762V12.4762Z' fill='currentColor' />
  </SvgIcon>
);

MicrosoftNeutral.displayName = 'MicrosoftNeutralIcon';
