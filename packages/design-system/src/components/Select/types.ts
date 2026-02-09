import type { FC } from 'react';
import type { SvgIconProps } from '../../icons';

export interface SelectDataItem {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  category?: string;
  icon?: FC<SvgIconProps>;
}
