import { type FC, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SearchModalContext } from './SearchModalContext';
import type { SearchModalContextValue } from './types';

interface SearchModalProviderProps {
  children: ReactNode;
  open?: boolean;
  onQueryChange?: (query: string) => void;
  onClose: () => void;
}

export const SearchModalProvider: FC<SearchModalProviderProps> = ({
  children,
  open,
  onQueryChange,
  onClose,
}) => {
  const [query, setQueryState] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const onQueryChangeRef = useRef(onQueryChange);
  onQueryChangeRef.current = onQueryChange;

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (open) {
      setQueryState('');
      setActiveIndex(0);
    }
  }, [open]);

  const setQuery = useCallback((value: string) => {
    setQueryState(value);
    setActiveIndex(0);
    onQueryChangeRef.current?.(value);
  }, []);

  const close = useCallback(() => {
    onCloseRef.current();
  }, []);

  const getItems = useCallback(
    () =>
      listRef.current
        ? Array.from(
            listRef.current.querySelectorAll<HTMLElement>('[data-search-item]:not([disabled])'),
          )
        : [],
    [],
  );

  const contextValue = useMemo<SearchModalContextValue>(
    () => ({
      query,
      setQuery,
      activeIndex,
      setActiveIndex,
      close,
      getItems,
      inputRef,
      listRef,
    }),
    [query, activeIndex, setQuery, close, getItems],
  );

  return <SearchModalContext.Provider value={contextValue}>{children}</SearchModalContext.Provider>;
};
