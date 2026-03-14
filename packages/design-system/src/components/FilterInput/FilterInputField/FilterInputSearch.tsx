import type { FC } from 'react';
import { useFilterInputContext } from '../FilterInputContext';
import { filterInputInputVariants } from './classes';

/** Approximate width of a single character in px (text-sm monospace) */
const CHAR_WIDTH_PX = 8;

interface FilterInputSearchProps {
  hasContent: boolean;
  minWidth?: number;
}

export const FilterInputSearch: FC<FilterInputSearchProps> = ({ hasContent, minWidth = 4 }) => {
  const {
    inputText,
    inputRef,
    placeholder,
    error,
    menuOpen,
    onInputChange,
    onInputKeyDown,
    onInputClick,
  } = useFilterInputContext();

  return (
    <input
      ref={inputRef}
      type='text'
      role='combobox'
      aria-expanded={menuOpen}
      aria-invalid={error}
      aria-label={placeholder || 'Filter conditions'}
      aria-autocomplete='list'
      value={inputText}
      onChange={onInputChange}
      onKeyDown={onInputKeyDown}
      onClick={onInputClick}
      placeholder={hasContent ? undefined : placeholder}
      style={
        hasContent
          ? { width: `${Math.max(minWidth, inputText.length * CHAR_WIDTH_PX)}px` }
          : undefined
      }
      className={filterInputInputVariants({ hasContent })}
    />
  );
};

FilterInputSearch.displayName = 'FilterInputSearch';
