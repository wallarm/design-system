import type { FC, HTMLAttributes, KeyboardEvent, Ref, RefObject } from 'react';
import { useMemo } from 'react';
import type { Proton, Segment } from '@wallarm-org/rules-lib';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { Tag } from '../../Tag';
import {
  chipSeparatorClasses,
  pendingLabelClasses,
  whereBarInputClasses,
  whereBarVariants,
} from './classes';

export interface WhereBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Ref forwarding to root element */
  ref?: Ref<HTMLDivElement>;
  /** Container ref for menu positioning */
  barRef?: RefObject<HTMLDivElement | null>;
  /** Input ref for focus management */
  inputRef?: RefObject<HTMLInputElement | null>;
  /** Parsed segments to display as chips */
  segments: Segment[];
  /** Proton SDK instance for rendering segment labels */
  proton?: Proton | null;
  /** Rendered point string (for keys and error span calculation) */
  pointString?: string;
  /** Placeholder chip while a name or a multi-select is being answered. */
  pendingLabel?: string;
  /** Whether to show the input field */
  showInput: boolean;
  /** Whether the bar is editable */
  editable: boolean;
  /** Current query/search text */
  query: string;
  /** Placeholder text for input */
  placeholder?: string;
  /** Whether menu is open */
  open?: boolean;
  /** The step menu's id (see StepMenu `contentId`). */
  menuId?: string;
  /** Error span to highlight (character range in point string) */
  errorSpan?: [number, number];
  /** Error message to show in tooltip on hover */
  errorMessage?: string;
  /** Called when query changes */
  onQueryChange: (query: string) => void;
  /** Called on keyboard input */
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  /** Called when input is focused */
  onFocus: () => void;
  /** Called when chip is clicked */
  onChipClick: (index: number) => void;
}

/**
 * The query bar: one chip per chosen step, then the input. Styled with the
 * design system's input tokens, like the FilterInput field. A chip click
 * re-opens the point from that step.
 */
export const WhereBar: FC<WhereBarProps> = ({
  ref,
  barRef,
  inputRef,
  segments,
  proton,
  pointString = '',
  pendingLabel = '',
  showInput,
  editable,
  query,
  placeholder = '',
  open = false,
  menuId,
  errorSpan,
  errorMessage,
  className,
  onQueryChange,
  onKeyDown,
  onFocus,
  onChipClick,
  ...props
}) => {
  const testId = useTestId('bar');

  // Compute labels for segments on the fly without mutating them
  const segmentLabels = useMemo(() => {
    if (!proton) return segments.map(s => (s as any).label || '');

    // To render each segment's label, we need to render the full path up to that segment
    // then extract just the last part. This is because some segments (like dup_index)
    // can't be rendered in isolation.
    return segments.map((seg, i) => {
      // If segment already has a label, use it
      if ((seg as any).label) return (seg as any).label;

      // Render the path up to and including this segment
      try {
        const pathUpToHere = segments.slice(0, i + 1);
        const fullPath = proton.point.render(pathUpToHere);

        // If this is the first segment, the label is the full path
        if (i === 0) return fullPath;

        // Otherwise, render the path up to (but not including) this segment
        // and extract just the new part
        const pathBefore = proton.point.render(segments.slice(0, i));

        // The label is the difference between the two paths
        if (fullPath.startsWith(pathBefore)) {
          return fullPath.slice(pathBefore.length);
        }

        // Fallback: return the full path
        return fullPath;
      } catch {
        return '';
      }
    });
  }, [segments, proton]);

  // Calculate which segments fall within error span
  // Uses segment.text lengths since we don't have SDK here
  const getSegmentInError = (segmentIndex: number): boolean => {
    if (!errorSpan) return false;

    let currentPos = 0;
    let segmentStart = 0;
    let segmentEnd = 0;

    // Find character positions for this segment
    for (let i = 0; i <= segmentIndex; i++) {
      const seg = segments[i];
      segmentStart = currentPos;
      segmentEnd = currentPos + (seg?.text?.length || 0);
      currentPos = segmentEnd;
    }

    // Check if segment overlaps with error span
    return segmentEnd > errorSpan[0] && segmentStart < errorSpan[1];
  };

  return (
    <div
      {...props}
      ref={ref ?? barRef}
      data-slot='where-bar'
      data-testid={testId}
      data-open={open || undefined}
      className={cn(whereBarVariants({ editable }), className)}
    >
      {segments.map((s, i) => {
        const isInError = getSegmentInError(i);
        const label = segmentLabels[i];
        // Use segment index as key (stable for this render)
        return (
          <span key={i} className='flex items-center gap-6'>
            <Tag asChild>
              <button
                type='button'
                onClick={() => onChipClick(i)}
                title={isInError && errorMessage ? errorMessage : `Change what follows ${label}`}
                className={cn(isInError && 'ring-2 ring-border-critical')}
              >
                {label}
              </button>
            </Tag>
            {(i < segments.length - 1 || showInput || pendingLabel) && (
              <span className={chipSeparatorClasses} aria-hidden>
                ›
              </span>
            )}
          </span>
        );
      })}
      {pendingLabel && <span className={pendingLabelClasses}>{pendingLabel}</span>}
      {showInput && (
        <input
          ref={inputRef}
          role='combobox'
          aria-label='type to filter, or the number of an option'
          aria-haspopup='listbox'
          aria-controls={menuId}
          aria-expanded={open}
          className={whereBarInputClasses}
          value={query}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete='off'
          onChange={e => onQueryChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          // Focus alone misses a click on the bar that already has focus (after
          // Esc or an outside click closed the menu): open on the click too.
          onClick={onFocus}
        />
      )}
    </div>
  );
};

WhereBar.displayName = 'WhereBar';
