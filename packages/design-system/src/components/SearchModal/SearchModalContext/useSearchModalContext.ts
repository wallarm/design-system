import { useContext } from 'react';
import { SearchModalContext } from './SearchModalContext';

export const useSearchModalContext = () => {
  const context = useContext(SearchModalContext);

  if (!context) {
    throw new Error('useSearchModalContext must be used within a SearchModal');
  }

  return context;
};
