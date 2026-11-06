import type { ButtonHTMLAttributes, FC, MouseEvent, ReactNode, Ref } from 'react';
import { useCallback, useRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';
import { useTestId } from '../../utils/testId';
import { searchModalItemVariants } from './classes';
import { useSearchModalContext } from './SearchModalContext';

export interface SearchModalItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
  /** Called when the item is selected (Enter key or click) */
  onSelect?: () => void;
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Render as child element (e.g. for <a> links) */
  asChild?: boolean;
  /** Whether selecting this item closes the modal (default: true) */
  closeOnSelect?: boolean;
}

export const SearchModalItem: FC<SearchModalItemProps> = ({
  ref,
  children,
  onSelect,
  disabled = false,
  asChild = false,
  closeOnSelect = true,
  className,
  onClick,
  onMouseEnter,
  ...props
}) => {
  const testId = useTestId('item');
  const { activeIndex, setActiveIndex, getItems, close } = useSearchModalContext();
  const itemRef = useRef<HTMLElement | null>(null);

  const getOwnIndex = useCallback(() => {
    if (!itemRef.current) return -1;
    const items = getItems();
    return items.indexOf(itemRef.current);
  }, [getItems]);

  const ownIndex = getOwnIndex();
  const active = ownIndex >= 0 && ownIndex === activeIndex;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onClick?.(e);
    onSelect?.();
    if (closeOnSelect) close();
  };

  const handleMouseEnter = (e: MouseEvent<HTMLButtonElement>) => {
    onMouseEnter?.(e);
    const index = getOwnIndex();
    if (index >= 0) setActiveIndex(index);
  };

  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      {...props}
      ref={mergeRefs(itemRef, ref)}
      type={asChild ? undefined : 'button'}
      data-slot='search-modal-item'
      data-testid={testId}
      data-search-item=''
      role='option'
      aria-selected={active}
      disabled={disabled}
      className={cn(searchModalItemVariants({ active, disabled }), className)}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </Comp>
  );
};

SearchModalItem.displayName = 'SearchModalItem';
