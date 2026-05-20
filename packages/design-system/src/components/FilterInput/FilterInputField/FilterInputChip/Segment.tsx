import type { FC, FocusEvent, HTMLAttributes, KeyboardEvent } from 'react';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { cn } from '../../../../utils/cn';
import { FilterInputContext } from '../../FilterInputContext/FilterInputContext';
import { segmentContainer, segmentTextVariants } from './classes';
import { CHAR_WIDTH_PX } from './constants';
import { MultiValueSegment } from './MultiValueSegment';
import { useSizerWidth } from './model/useSizerWidth';
import { SEGMENT_VARIANT, type SegmentVariant } from './segmentVariant';

export type SegmentProps = HTMLAttributes<HTMLDivElement> & {
  variant: SegmentVariant;
  children: string;
  error?: boolean;
  editing?: boolean;
  editText?: string;
  onEditChange?: (text: string) => void;
  onEditKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onEditBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  /** Individual display parts for multi-value chips (value variant only) */
  valueParts?: string[];
  /** Separator between parts (default: ", ") */
  valueSeparator?: string;
  /** Indices of invalid values in valueParts */
  errorValueIndices?: number[];
};

export const Segment: FC<SegmentProps> = ({
  variant,
  children,
  className,
  error,
  editing,
  editText,
  onEditChange,
  onEditKeyDown,
  onEditBlur,
  valueParts,
  valueSeparator = ', ',
  errorValueIndices,
  ...props
}) => {
  const textRef = useRef<HTMLParagraphElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sizerRef = useRef<HTMLSpanElement>(null);

  // Register segment input in the context ref registry so useFocusManagement
  // can focus it without querySelector. useContext (null-safe) tolerates
  // rendering Segment outside FilterInputProvider in unit tests.
  const filterInputContext = useContext(FilterInputContext);
  const segmentInputRef =
    variant === SEGMENT_VARIANT.attribute
      ? filterInputContext?.segmentAttributeInputRef
      : variant === SEGMENT_VARIANT.operator
        ? filterInputContext?.segmentOperatorInputRef
        : variant === SEGMENT_VARIANT.value
          ? filterInputContext?.segmentValueInputRef
          : null;
  const lastTextWidthRef = useRef<number>(0);

  // Sub-pixel-precise width measurement (avoids layout shift) when not editing.
  useEffect(() => {
    if (editing) return;
    const width = textRef.current?.getBoundingClientRect().width ?? children.length * CHAR_WIDTH_PX;
    lastTextWidthRef.current = width;
  }, [editing, children]);

  // Auto-focus on entering edit: double rAF beats Ark UI/zag.js focus steal
  // (single rAF). Fragile if Ark UI changes its focus timing.
  useEffect(() => {
    if (!editing) return;
    let innerFrame = 0;
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    });
    return () => {
      cancelAnimationFrame(outerFrame);
      cancelAnimationFrame(innerFrame);
    };
  }, [editing]);

  const inputWidth = useSizerWidth({
    sizerRef,
    text: editText ?? '',
  });

  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (segmentInputRef) segmentInputRef.current = node;
    },
    [segmentInputRef],
  );

  const isInteractive = !!props.onClick;
  const hasMultiValueErrors =
    variant === SEGMENT_VARIANT.value &&
    !!valueParts &&
    !!errorValueIndices &&
    errorValueIndices.length > 0 &&
    !editing;

  if (hasMultiValueErrors) {
    return (
      <MultiValueSegment
        valueParts={valueParts!}
        valueSeparator={valueSeparator}
        errorValueIndices={errorValueIndices!}
        className={className}
        {...props}
      />
    );
  }

  return (
    <div
      className={cn(segmentContainer, className)}
      data-slot={`segment-${variant}`}
      {...(isInteractive && { role: 'button', 'aria-label': `Edit filter ${variant}` })}
      {...props}
    >
      {editing ? (
        <>
          <input
            ref={setInputRef}
            size={1}
            value={editText ?? ''}
            onChange={e => onEditChange?.(e.target.value)}
            onKeyDown={onEditKeyDown}
            onBlur={onEditBlur}
            aria-label={`Filter ${variant}`}
            className={cn(
              segmentTextVariants({ variant, error }),
              'bg-transparent outline-none p-0 m-0',
            )}
            style={{ width: `${inputWidth}px` }}
          />
          <span
            ref={sizerRef}
            className={cn(
              segmentTextVariants({ variant, error }),
              'invisible absolute whitespace-pre',
            )}
            aria-hidden
          >
            {editText || ' '}
          </span>
        </>
      ) : (
        <p ref={textRef} className={segmentTextVariants({ variant, error })}>
          {children}
        </p>
      )}
    </div>
  );
};

Segment.displayName = 'Segment';
