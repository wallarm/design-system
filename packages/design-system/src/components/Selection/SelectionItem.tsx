import { type FC, type ReactNode, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Checkbox, CheckboxIndicator } from '../Checkbox';
import { selectionItemVariants } from './classes';
import { useSelectionContext } from './useSelectionContext';

export interface SelectionItemProps {
  /** Item id — must match an id present in the `<Selection>` `items` prop. */
  itemId: string;
  /** When true, the checkbox is disabled and the item is excluded from select-all and ranges. */
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

export const SelectionItem: FC<SelectionItemProps> = ({
  itemId,
  disabled = false,
  className,
  children,
}) => {
  const { isSelected, toggleItem, registerDisabled } = useSelectionContext();
  const selected = isSelected(itemId);

  useEffect(() => {
    return registerDisabled(itemId, disabled);
  }, [itemId, disabled, registerDisabled]);

  // Shift-click toggles a range. The browser suppresses the label→input
  // forwarding click when a modifier key is held (verified in Chromium),
  // so ARK's onCheckedChange never fires. Intercept on the wrapper, but
  // only for label/wrapper targets — not the hidden input itself, where
  // keyboard Shift+Space already toggles the state and ARK fires
  // onCheckedChange on its own.
  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !e.shiftKey) return;
    if (e.target instanceof HTMLInputElement) return;
    e.preventDefault();
    e.stopPropagation();
    toggleItem(itemId, { shiftKey: true });
  };

  return (
    <div
      data-slot='selection-item'
      data-selected={selected || undefined}
      className={cn(selectionItemVariants(), className)}
      onClickCapture={handleClickCapture}
    >
      <Checkbox checked={selected} disabled={disabled} onCheckedChange={() => toggleItem(itemId)}>
        <CheckboxIndicator />
      </Checkbox>
      {children}
    </div>
  );
};

SelectionItem.displayName = 'SelectionItem';
