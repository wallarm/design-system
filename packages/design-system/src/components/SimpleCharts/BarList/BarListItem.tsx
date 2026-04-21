import {
  type FC,
  type HTMLAttributes,
  type KeyboardEvent,
  type Ref,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { clamp01 } from '../lib/clamp01';
import { BarListContext, BarListItemContext, type BarListItemContextValue } from './BarListContext';
import { barListItemVariants } from './classes';

export interface BarListItemProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  value: number;
  /**
   * Marks the row as visually active (selected / filtered). Applies the
   * hover background + `aria-current`. The bar width and percent label are
   * driven purely by `value / max` — `selected` never changes the fill.
   */
  selected?: boolean;
}

export const BarListItem: FC<BarListItemProps> = ({
  value,
  selected = false,
  className,
  children,
  ref,
  onClick,
  onKeyDown,
  ...props
}) => {
  const testId = useTestId('item');
  const listCtx = useContext(BarListContext);

  const interactive = typeof onClick === 'function';

  const ratio = useMemo(() => {
    const isValidValue = Number.isFinite(value);
    return listCtx?.isValidMax && isValidValue ? clamp01(value / (listCtx?.max ?? 1)) : 0;
  }, [value, listCtx?.isValidMax, listCtx?.max]);

  const itemValue = useMemo<BarListItemContextValue>(
    () => ({ ratio, selected, interactive }),
    [ratio, selected, interactive],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (!interactive || event.defaultPrevented) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.currentTarget.click();
      }
    },
    [interactive, onKeyDown],
  );

  return (
    <BarListItemContext.Provider value={itemValue}>
      <div
        {...props}
        ref={ref}
        data-slot='bar-list-item'
        data-testid={testId}
        data-selected={selected ? 'true' : undefined}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-current={selected ? 'true' : undefined}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={cn(barListItemVariants({ interactive, selected }), className)}
      >
        {children}
      </div>
    </BarListItemContext.Provider>
  );
};

BarListItem.displayName = 'BarListItem';
