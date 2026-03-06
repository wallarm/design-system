import type { FC, HTMLAttributes } from 'react';
import { useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { inputVariants } from '../../Input/classes';
import { findChipSplitIndex } from '../lib';
import { useQueryBarContext } from '../QueryBarContext';
import { QueryBarChip } from './QueryBarChip/QueryBarChip';
import { QueryBarInputActions } from './QueryBarInputActions';
import { ChipsWithGaps, TrailingGap } from './ChipsWithGaps';

type QueryBarInputProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

export const QueryBarInput: FC<QueryBarInputProps> = ({ className, ...props }) => {
  const {
    chips,
    buildingChipData,
    buildingChipRef,
    inputText,
    inputRef,
    placeholder,
    error,
    menuOpen,
    insertIndex,
    insertAfterConnector,
    onInputChange,
    onInputKeyDown,
    onInputClick,
    onGapClick,
    onChipClick,
    onConnectorChange,
    onChipRemove,
  } = useQueryBarContext();

  const hasContent = chips.length > 0 || buildingChipData != null;

  const chipSplitIndex = useMemo(
    () => findChipSplitIndex(chips, insertIndex, insertAfterConnector),
    [chips, insertIndex, insertAfterConnector],
  );

  const chipsBefore = useMemo(() => chips.slice(0, chipSplitIndex), [chips, chipSplitIndex]);
  const chipsAfter = useMemo(() => chips.slice(chipSplitIndex), [chips, chipSplitIndex]);

  // Hide the gap that sits right next to the input cursor
  const lastBefore = chipsBefore[chipsBefore.length - 1];
  const firstAfter = chipsAfter[0];
  const hideTrailingGap = lastBefore?.variant === 'and' || lastBefore?.variant === 'or';
  const hideLeadingGap = firstAfter?.variant === 'and' || firstAfter?.variant === 'or';

  return (
    <div
      className={cn(
        'relative flex min-h-40 w-full items-center overflow-hidden',
        inputVariants({ error }),
        'px-0',
        'focus-within:outline-none focus-within:ring-3',
        !error && 'focus-within:not-disabled:border-border-strong-primary focus-within:ring-focus-primary',
        error && 'focus-within:ring-focus-destructive',
        className,
      )}
      role='combobox'
      aria-expanded={menuOpen}
      aria-invalid={error}
      data-slot='query-bar'
      {...props}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className={cn('flex min-h-full flex-1 cursor-text flex-wrap items-center py-4 pr-4', hasContent ? 'pl-4' : 'pl-12')}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onInputClick();
          }
        }}
      >
        <ChipsWithGaps chips={chipsBefore} hideTrailingGap={hideTrailingGap} onChipClick={onChipClick} onConnectorChange={onConnectorChange} onChipRemove={onChipRemove} onGapClick={onGapClick} />

        {buildingChipData && (
          <div ref={buildingChipRef} className={cn('min-w-0', hasContent && 'ml-8')}>
            <QueryBarChip
              building
              attribute={buildingChipData.attribute ?? ''}
              operator={buildingChipData.operator}
              value={buildingChipData.value}
            />
          </div>
        )}
        <input
          ref={inputRef}
          type='text'
          value={inputText}
          onChange={onInputChange}
          onKeyDown={onInputKeyDown}
          onClick={onInputClick}
          placeholder={hasContent ? '' : placeholder}
          style={hasContent ? { width: `${Math.max(2, (inputText.length + 1) * 8)}px` } : undefined}
          className={cn('h-auto border-none bg-transparent p-0 text-sm shadow-none outline-none ring-0', hasContent ? 'mx-8' : 'flex-1')}
        />

        <ChipsWithGaps chips={chipsAfter} hideLeadingGap={hideLeadingGap} onChipClick={onChipClick} onConnectorChange={onConnectorChange} onChipRemove={onChipRemove} onGapClick={onGapClick} />

        {chipsAfter.length > 0 && <TrailingGap chips={chipsAfter} onGapClick={onGapClick} />}
      </div>

      <QueryBarInputActions />
    </div>
  );
};

QueryBarInput.displayName = 'QueryBarInput';
