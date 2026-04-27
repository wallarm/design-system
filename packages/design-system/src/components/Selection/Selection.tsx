import { type FC, type ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react/popover';
import { useIsKeyPressed } from '../../hooks/useIsKeyPressed';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { SelectionContext, type SelectionContextValue } from './SelectionContext';
import { useSelectionState } from './useSelectionState';

const SELECTION_BULKBAR_HEIGHT = 52;
const SELECTION_BULKBAR_OFFSET = 32;

const SELECTION_BULKBAR_POSITIONING: ArkUiPopover.RootProps['positioning'] = Object.freeze({
  strategy: 'fixed',
  placement: 'bottom',
  gutter: 32,
  overlap: true,
  flip: false,
  offset: {
    mainAxis: -(SELECTION_BULKBAR_HEIGHT + SELECTION_BULKBAR_OFFSET),
  },
});

export interface SelectionProps<T> extends TestableProps {
  /** Source array — used for select-all and shift-click range ordering. */
  items: T[];
  /** Stable id extractor for items. */
  getItemId: (item: T) => string;
  /** Controlled selection state — array of selected item ids. */
  value: string[];
  /** Called with the next ordered array of selected ids. */
  onChange: (ids: string[]) => void;
  className?: string;
  children?: ReactNode;
}

export const Selection = <T,>({
  items,
  getItemId,
  value,
  onChange,
  className,
  'data-testid': testId,
  children,
}: SelectionProps<T>) => {
  // Disabled-id registry — populated by <SelectionItem> via context callback.
  const disabledMapRef = useRef<Map<string, boolean>>(new Map());
  const [disabledTick, setDisabledTick] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: registry is ref-backed; tick is the re-evaluation trigger
  const disabledIds = useMemo(() => {
    const set = new Set<string>();
    for (const [id, isDisabled] of disabledMapRef.current) {
      if (isDisabled) set.add(id);
    }
    return set;
  }, [disabledTick]);

  const registerDisabled = useCallback<SelectionContextValue['registerDisabled']>(
    (id, disabled) => {
      disabledMapRef.current.set(id, disabled);
      setDisabledTick(t => t + 1);
      return () => {
        disabledMapRef.current.delete(id);
        setDisabledTick(t => t + 1);
      };
    },
    [],
  );

  const shiftKeyRef = useIsKeyPressed('Shift');

  const state = useSelectionState({ items, getItemId, value, onChange, disabledIds });

  // Wrap toggleItem so callers in the tree don't need to read shift themselves.
  const toggleItem = useCallback<SelectionContextValue['toggleItem']>(
    (id, opts) => {
      const shiftKey = opts?.shiftKey ?? shiftKeyRef.current;
      state.toggleItem(id, { shiftKey });
    },
    [shiftKeyRef, state],
  );

  const ctxValue = useMemo<SelectionContextValue>(
    () => ({
      itemIds: state.itemIds,
      enabledItemIds: state.enabledItemIds,
      selectedIds: state.selectedIds,
      isSelected: state.isSelected,
      isAllSelected: state.isAllSelected,
      isIndeterminate: state.isIndeterminate,
      toggleItem,
      selectAll: state.selectAll,
      clear: state.clear,
      registerDisabled,
    }),
    [
      state.itemIds,
      state.enabledItemIds,
      state.selectedIds,
      state.isSelected,
      state.isAllSelected,
      state.isIndeterminate,
      state.selectAll,
      state.clear,
      toggleItem,
      registerDisabled,
    ],
  );

  return (
    <SelectionContext.Provider value={ctxValue}>
      <TestIdProvider value={testId}>
        <ArkUiPopover.Root
          open={value.length > 0}
          closeOnInteractOutside={false}
          portalled={false}
          positioning={SELECTION_BULKBAR_POSITIONING}
        >
          <ArkUiPopover.Anchor
            data-slot='selection'
            data-testid={testId}
            className={cn('relative outline-none', className)}
          >
            {children}
          </ArkUiPopover.Anchor>
        </ArkUiPopover.Root>
      </TestIdProvider>
    </SelectionContext.Provider>
  );
};

Selection.displayName = 'Selection';
