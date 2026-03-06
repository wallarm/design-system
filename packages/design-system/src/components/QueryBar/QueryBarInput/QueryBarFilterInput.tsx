import type { FC } from 'react';
import { useQueryBarContext } from '../QueryBarContext';
import { queryBarInputVariants } from './classes';

interface QueryBarFilterInputProps {
  hasContent: boolean;
}

export const QueryBarFilterInput: FC<QueryBarFilterInputProps> = ({ hasContent }) => {
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
      style={hasContent ? { width: `${Math.max(4, inputText.length * 8)}px` } : undefined}
      className={queryBarInputVariants({ hasContent })}
    />
  );
};

QueryBarFilterInput.displayName = 'QueryBarFilterInput';
