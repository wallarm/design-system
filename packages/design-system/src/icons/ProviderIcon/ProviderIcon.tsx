import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from '../SvgIcon';
import { providerIconPaths } from './paths';
import type { ProviderIconName } from './types';

export interface ProviderIconProps extends Omit<SvgIconProps, 'children'> {
  name: ProviderIconName;
}

export const ProviderIcon: FC<ProviderIconProps> = ({ name, ...props }) => (
  <SvgIcon {...props} viewBox='0 0 24 24' data-slot='provider-icon'>
    {providerIconPaths[name]}
  </SvgIcon>
);

ProviderIcon.displayName = 'ProviderIcon';
