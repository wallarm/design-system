import type { RefObject } from 'react';

export interface SearchModalContextValue {
  query: string;
  setQuery: (query: string) => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  close: () => void;
  getItems: () => HTMLElement[];
  inputRef: RefObject<HTMLInputElement | null>;
  listRef: RefObject<HTMLDivElement | null>;
}
