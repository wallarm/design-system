import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { Dialog } from '@ark-ui/react/dialog';
import type { TestableProps } from '../../utils/testId';
import { TestIdProvider } from '../../utils/testId';
import { SearchModalProvider } from './SearchModalContext';

export interface SearchModalProps extends TestableProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onQueryChange?: (query: string) => void;
}

export const SearchModal: FC<SearchModalProps> = ({
  children,
  open,
  onOpenChange,
  onQueryChange,
  'data-testid': testId,
}) => {
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  const openRef = useRef(open);
  openRef.current = open;

  const handleOpenChange = useCallback(({ open }: Dialog.OpenChangeDetails) => {
    onOpenChangeRef.current?.(open);
  }, []);

  const handleClose = useCallback(() => {
    onOpenChangeRef.current?.(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChangeRef.current?.(!openRef.current);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <TestIdProvider value={testId}>
      <div data-slot='search-modal' data-testid={testId}>
        <Dialog.Root
          open={open}
          onOpenChange={handleOpenChange}
          closeOnEscape
          closeOnInteractOutside
          lazyMount
          unmountOnExit
        >
          <SearchModalProvider open={open} onQueryChange={onQueryChange} onClose={handleClose}>
            {children}
          </SearchModalProvider>
        </Dialog.Root>
      </div>
    </TestIdProvider>
  );
};

SearchModal.displayName = 'SearchModal';
