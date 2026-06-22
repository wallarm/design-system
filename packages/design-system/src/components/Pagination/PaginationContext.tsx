import { createContext, type FC, type ReactNode, useContext } from 'react';
import type { PaginationSize } from './types';

interface PaginationSizeContextValue {
  size: PaginationSize;
}

const PaginationSizeContext = createContext<PaginationSizeContextValue>({ size: 'medium' });

export const PaginationSizeProvider: FC<{ size: PaginationSize; children: ReactNode }> = ({
  size,
  children,
}) => <PaginationSizeContext.Provider value={{ size }}>{children}</PaginationSizeContext.Provider>;

export const usePaginationSizeContext = (): PaginationSizeContextValue =>
  useContext(PaginationSizeContext);
