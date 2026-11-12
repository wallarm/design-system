import type { FC, ReactNode } from 'react';
import type { SvgIconProps } from '../../icons';

export interface SelectDataItem {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  category?: string;
  icon?: FC<SvgIconProps>;
  /**
   * A leading element that is not an icon component, such as an agent's `AgentGlyph` (size 20 beside the
   * text-sm option and trigger). The trigger and `SelectInput` chips show it in place of `icon`.
   */
  leading?: ReactNode;
}
