import {
  type FC,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useCallback,
  useState,
} from 'react';
import { useTestId } from '../../utils/testId';
import { TREE_BASE_PADDING, useTreeDepth, useTreeGap, useTreeIndent } from './TreeContext';
import { TreeItemProvider } from './TreeItemContext';

export interface TreeItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
  collapsible?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const TreeItem: FC<TreeItemProps> = ({
  ref,
  children,
  collapsible = false,
  open: controlledOpen,
  defaultOpen = true,
  onOpenChange,
  style,
  ...props
}) => {
  const depth = useTreeDepth();
  const indent = useTreeIndent();
  const gap = useTreeGap();
  const testId = useTestId('item');

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const toggle = useCallback(() => {
    const next = !isOpen;
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  }, [isOpen, isControlled, onOpenChange]);

  const paddingLeft = depth === 1 ? TREE_BASE_PADDING + indent : indent;
  const itemGap = collapsible && gap ? gap / 2 : undefined;

  return (
    <TreeItemProvider value={{ collapsible, open: isOpen, toggle }}>
      <div
        ref={ref}
        data-slot='tree-item'
        data-testid={testId}
        style={{ paddingLeft, gap: itemGap, ...style }}
        {...props}
      >
        {children}
      </div>
    </TreeItemProvider>
  );
};

TreeItem.displayName = 'TreeItem';
