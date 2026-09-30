import type { FC, Ref } from 'react';
import { Portal as ArkUiPortal } from '@ark-ui/react/portal';
import { Select as ArkUiSelect } from '@ark-ui/react/select';
import { cn } from '../../utils/cn';
import { dropdownMenuClassNames } from '../DropdownMenu';

export interface SelectPositionerProps extends ArkUiSelect.PositionerProps {
  /**
   * Props for the content element (the `listbox` panel inside the positioner) — for a ref, an
   * inline measurement such as a locked width, or `data-*` attributes. `className` on the
   * positioner itself already lands on the content, and overrides its default sizes
   * (`min-w-240 max-w-320 max-h-(--available-height)`) through tailwind-merge.
   */
  contentProps?: Omit<ArkUiSelect.ContentProps, 'className' | 'children' | 'asChild'> & {
    ref?: Ref<HTMLDivElement>;
    [dataAttribute: `data-${string}`]: string | undefined;
  };
}

export const SelectPositioner: FC<SelectPositionerProps> = ({
  className,
  children,
  contentProps,
  ...props
}) => (
  <ArkUiPortal>
    <ArkUiSelect.Positioner {...props} className='outline-none'>
      <ArkUiSelect.Content
        {...contentProps}
        className={cn(
          dropdownMenuClassNames,
          'flex flex-col',
          'h-full',
          'min-w-240',
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
