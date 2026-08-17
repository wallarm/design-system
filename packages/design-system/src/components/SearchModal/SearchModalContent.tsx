import type { FC, HTMLAttributes, KeyboardEvent, ReactNode, Ref } from 'react';
import { useEffect } from 'react';
import { Dialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Overlay } from '../Overlay';
import { searchModalContentVariants } from './classes';
import { useSearchModalContext } from './SearchModalContext';

export interface SearchModalContentProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

export const SearchModalContent: FC<SearchModalContentProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const testId = useTestId('content');
  const { activeIndex, setActiveIndex, getItems, inputRef } = useSearchModalContext();

  useEffect(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [inputRef]);

  useEffect(() => {
    if (activeIndex >= 0) {
      const items = getItems();
      items[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, getItems]);

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const totalItems = getItems().length;
      if (totalItems === 0) return;

      if (e.key === 'ArrowDown') {
        setActiveIndex(activeIndex + 1 >= totalItems ? 0 : activeIndex + 1);
      } else {
        setActiveIndex(activeIndex - 1 < 0 ? totalItems - 1 : activeIndex - 1);
      }
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      getItems()[activeIndex]?.click();
    }
  };

  return (
    <Portal>
      <Dialog.Backdrop asChild>
        <Overlay />
      </Dialog.Backdrop>

      <Dialog.Positioner className='fixed inset-0 z-[calc(var(--drawer-overlay-z-index)+1)] flex items-start justify-center pt-[10vh]'>
        <Dialog.Content
          {...props}
          ref={ref}
          data-slot='search-modal-content'
          data-testid={testId}
          className={cn(searchModalContentVariants(), className)}
          onKeyDown={handleKeyDown}
        >
          {children}
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  );
};

SearchModalContent.displayName = 'SearchModalContent';
