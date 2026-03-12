import type { FC } from 'react';
import { useQueryBarContext } from '../QueryBarContext';
import { queryBarInputVariants } from './classes';

/** Approximate width of a single character in px (text-sm monospace) */
const CHAR_WIDTH_PX = 8;

interface QueryBarFilterInputProps {
  hasContent: boolean;
  minWidth?: number;
}

export const QueryBarFilterInput: FC<QueryBarFilterInputProps> = ({ hasContent, minWidth = 4 }) => {
  const {
    inputText,
    inputRef,
    placeholder,
    error,
    menuOpen,
    onInputChange,
    onInputKeyDown,
    onInputClick,
  } = useQueryBarContext();

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
      className={queryBarInputVariants({ hasContent })}
    />
  );
};

QueryBarFilterInput.displayName = 'QueryBarFilterInput';
