import type { FC, HTMLAttributes } from 'react';
import { useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { inputVariants } from '../../Input/classes';
import { findChipSplitIndex } from '../lib';
import { useQueryBarContext } from '../QueryBarContext';
import { QueryBarChip } from './QueryBarChip/QueryBarChip';
import { QueryBarInputActions } from './QueryBarInputActions';
import { ChipsWithGaps, TrailingGap } from './ChipsWithGaps';
import { queryBarContainerVariants, queryBarInnerVariants, queryBarInputVariants } from './classes';

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
        inputVariants({ error }),
        queryBarContainerVariants({ error }),
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
        className={queryBarInnerVariants({ hasContent })}
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
          className={queryBarInputVariants({ hasContent })}
        />

        <ChipsWithGaps chips={chipsAfter} hideLeadingGap={hideLeadingGap} onChipClick={onChipClick} onConnectorChange={onConnectorChange} onChipRemove={onChipRemove} onGapClick={onGapClick} />

        {chipsAfter.length > 0 && <TrailingGap chips={chipsAfter} onGapClick={onGapClick} />}
      </div>

      <QueryBarInputActions />
    </div>
  );
};

QueryBarInput.displayName = 'QueryBarInput';
