import type { FC } from 'react';

import { Portal as ArkUiPortal } from '@ark-ui/react/portal';
import { Select as ArkUiSelect } from '@ark-ui/react/select';

import { cn } from '../../utils/cn';
import { dropdownMenuClassNames } from '../DropdownMenu';

type SelectPositionerProps = ArkUiSelect.PositionerProps;

export const SelectPositioner: FC<SelectPositionerProps> = ({
  className,
  children,
  ...props
}) => (
  <ArkUiPortal>
    <ArkUiSelect.Positioner {...props} className="outline-none">
      <ArkUiSelect.Content
        className={cn(
          dropdownMenuClassNames,
          'flex flex-col',
          'h-full',
          'min-w-280',
          'max-w-320',
          'max-h-(--available-height)',
          'p-0',
          'origin-[--transform-origin]',
          className,
        )}
      >
        {children}
      </ArkUiSelect.Content>
    </ArkUiSelect.Positioner>
  </ArkUiPortal>
);

SelectPositioner.displayName = 'SelectPositioner';
