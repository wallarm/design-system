import type { FC } from 'react';
import { useContext, useRef } from 'react';
import { cn } from '../../../../utils/cn';
import { FilterInputContext } from '../../FilterInputContext/FilterInputContext';
import { segmentTextVariants } from './classes';
import { useSizerWidth } from './model/useSizerWidth';

/**
 * Inline search input rendered inside a building chip.
 * Reads input state from FilterInputContext.
 * Uses a hidden sizer span to measure width (same approach as Segment).
 * Renders nothing when used outside of FilterInput (e.g. in Storybook or tests).
 */
export const ChipSearchInput: FC = () => {
  const ctx = useContext(FilterInputContext);
  const sizerRef = useRef<HTMLSpanElement>(null);

  const inputText = ctx?.inputText ?? '';
  const inputWidth = useSizerWidth({ sizerRef, text: inputText });

  if (!ctx) return null;

  const { inputRef, error, menuOpen, onInputChange, onInputKeyDown, onInputClick } = ctx;

  return (
    <>
      <input
        ref={inputRef}
        type='text'
        role='combobox'
        aria-expanded={menuOpen}
        aria-invalid={error}
        aria-label='Filter value'
        aria-autocomplete='list'
        value={inputText}
        onChange={onInputChange}
        onKeyDown={onInputKeyDown}
        onClick={onInputClick}
        style={{ width: `${inputWidth}px` }}
        className='h-22 border-none bg-transparent p-0 text-sm shadow-none outline-none ring-0'
      />
      <span
        ref={sizerRef}
        className={cn(segmentTextVariants({ variant: 'value' }), 'invisible absolute whitespace-pre')}
        aria-hidden
      >
        {inputText || ' '}
      </span>
    </>
  );
};

ChipSearchInput.displayName = 'ChipSearchInput';
