import { type FC, type ReactNode, useMemo } from 'react';
import { Menu } from '@ark-ui/react/menu';
import { DropdownMenuContext, useDropdownMenuContext } from './DropdownMenuContext';

interface DropdownMenuProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  /** Virtual anchor point for positioning without a trigger element */
  anchorPoint?: { x: number; y: number };
  /** Override default positioning config */
  positioning?: Menu.RootProps['positioning'];
  /** Programmatically control which item is highlighted */
  highlightedValue?: string | null;
  /** Whether selecting an item closes the menu (default true) */
  closeOnSelect?: boolean;
}

const ROOT_POSITIONING: Menu.RootProps['positioning'] = {
  placement: 'bottom-start',
  gutter: 4,
  overflowPadding: 4,
};

const SUB_POSITIONING: Menu.RootProps['positioning'] = {
  placement: 'right-start',
  gutter: 4,
  offset: { crossAxis: -9 },
};

export const DropdownMenu: FC<DropdownMenuProps> = ({
  children,
  open,
  defaultOpen,
  onOpenChange,
  anchorPoint,
  positioning,
  highlightedValue,
  closeOnSelect,
  ...props
}) => {
  const parent = useDropdownMenuContext();
  const isNested = parent !== null;

  const defaultPositioning = isNested ? SUB_POSITIONING : ROOT_POSITIONING;

  const handleOpenChange = (details: Menu.OpenChangeDetails) => {
    onOpenChange?.(details.open);
  };

  const ctx = useMemo(() => ({ isNested: true }), []);

  return (
    <DropdownMenuContext value={ctx}>
      <Menu.Root
        {...props}
        positioning={positioning ?? defaultPositioning}
        {...(anchorPoint != null && { anchorPoint })}
        {...(highlightedValue != null && { highlightedValue })}
        {...(closeOnSelect != null && { closeOnSelect })}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={handleOpenChange}
        lazyMount
        unmountOnExit
      >
        {children}
      </Menu.Root>
    </DropdownMenuContext>
  );
};

DropdownMenu.displayName = 'DropdownMenu';
