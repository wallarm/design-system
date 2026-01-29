import type { FC } from 'react';

import { Select as ArkUiSelect } from '@ark-ui/react/select';

import { ChevronDown } from '../../icons';
import { cn } from '../../utils/cn';

interface SelectArrowProps {
  className?: string;
}

export const SelectArrow: FC<SelectArrowProps> = ({ className }) => (
  <ArkUiSelect.Indicator
    className={cn(
      'ml-auto icon-md transition-transform data-[state=open]:rotate-180',
      className,
    )}
    asChild
  >
    <ChevronDown />
  </ArkUiSelect.Indicator>
);
