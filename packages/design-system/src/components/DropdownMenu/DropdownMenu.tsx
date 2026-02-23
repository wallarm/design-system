import { type FC, type ReactNode, useMemo } from 'react';
import { Menu } from '@ark-ui/react/menu';
import { DropdownMenuContext, useDropdownMenuContext } from './DropdownMenuContext';

interface DropdownMenuProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
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
  ...props
}) => {
  const parent = useDropdownMenuContext();
  const isNested = parent !== null;

  const handleOpenChange = (details: Menu.OpenChangeDetails) => {
    onOpenChange?.(details.open);
  };

  const ctx = useMemo(() => ({ isNested: true }), []);

  return (
    <DropdownMenuContext value={ctx}>
      <Menu.Root
        {...props}
        positioning={isNested ? SUB_POSITIONING : ROOT_POSITIONING}
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
