import { type FC, type ReactNode, useMemo } from 'react';
import { Menu } from '@ark-ui/react/menu';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { DropdownMenuContext, useDropdownMenuContext } from './DropdownMenuContext';

interface DropdownMenuProps extends TestableProps {
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
  /** Callback when the highlighted item changes (e.g. on mouse hover) */
  onHighlightChange?: (details: Menu.HighlightChangeDetails) => void;
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
  onHighlightChange,
  closeOnSelect,
  'data-testid': testId,
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
      <TestIdProvider value={testId}>
        <Menu.Root
          {...props}
          positioning={positioning ?? defaultPositioning}
          {...(anchorPoint != null && { anchorPoint })}
          {...(highlightedValue != null && { highlightedValue })}
          {...(closeOnSelect != null && { closeOnSelect })}
          {...(onHighlightChange != null && { onHighlightChange })}
          open={open}
          defaultOpen={defaultOpen}
          onOpenChange={handleOpenChange}
          lazyMount
          unmountOnExit
        >
          {children}
        </Menu.Root>
      </TestIdProvider>
    </DropdownMenuContext>
  );
};

DropdownMenu.displayName = 'DropdownMenu';
