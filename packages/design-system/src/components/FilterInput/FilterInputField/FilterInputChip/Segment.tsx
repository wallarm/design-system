import type { FC, FocusEvent, HTMLAttributes, KeyboardEvent } from 'react';
import { useEffect, useRef } from 'react';
import { cn } from '../../../../utils/cn';
import { segmentContainer, segmentTextVariants } from './classes';
import { CHAR_WIDTH_PX } from './constants';
import { MultiValueSegment } from './MultiValueSegment';
import { useSizerWidth } from './model/useSizerWidth';

type SegmentVariant = 'attribute' | 'operator' | 'value';

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
  const lastTextWidthRef = useRef<number>(0);

  // Measure text width when content changes (only while not editing).
  // Uses getBoundingClientRect for sub-pixel precision to avoid layout shift.
  useEffect(() => {
    if (editing) return;
    const width = textRef.current?.getBoundingClientRect().width ?? children.length * CHAR_WIDTH_PX;
    lastTextWidthRef.current = width;
  }, [editing, children]);

  // Auto-focus when entering edit mode.
  // Double rAF is needed to beat Ark UI's focus steal via zag.js (which uses single rAF).
  // If Ark UI changes its focus timing, this workaround may need updating.
  useEffect(() => {
    if (!editing) return;
    let outer = 0;
    let inner = 0;
    outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [editing]);

  const inputWidth = useSizerWidth({
    sizerRef,
    text: editText ?? '',
  });

  const isInteractive = !!props.onClick;
  const hasMultiValueErrors =
    variant === 'value' &&
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
            ref={inputRef}
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
