import type { FC, FocusEvent, HTMLAttributes, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../../../utils/cn';
import { segmentContainer, segmentTextVariants } from './classes';

type SegmentVariant = 'attribute' | 'operator' | 'value';

type SegmentProps = HTMLAttributes<HTMLDivElement> & {
  variant: SegmentVariant;
  children: string;
  editing?: boolean;
  editText?: string;
  onEditChange?: (text: string) => void;
  onEditKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onEditBlur?: (e: FocusEvent<HTMLInputElement>) => void;
};

export const Segment: FC<SegmentProps> = ({
  variant,
  children,
  className,
  editing,
  editText,
  onEditChange,
  onEditKeyDown,
  onEditBlur,
  ...props
}) => {
  const textRef = useRef<HTMLParagraphElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sizerRef = useRef<HTMLSpanElement>(null);
  // Track last known text width so it's available when switching to edit mode
  const lastTextWidthRef = useRef<number>(0);
  const [inputWidth, setInputWidth] = useState<number | undefined>(undefined);

  // Measure text width when content changes (only while not editing)
  useEffect(() => {
    if (editing || !textRef.current) return;
    lastTextWidthRef.current = textRef.current.offsetWidth;
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

  // Dynamically measure input width from hidden sizer span
  useEffect(() => {
    if (!editing) {
      setInputWidth(undefined);
      return;
    }
    const sizerWidth = sizerRef.current?.offsetWidth ?? 0;
    // Use max of original text width and current content, with a minimum of 20px
    setInputWidth(Math.max(20, lastTextWidthRef.current, sizerWidth + 2));
  }, [editing, editText]);

  const isInteractive = !!props.onClick;

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
              segmentTextVariants({ variant }),
              'bg-transparent border-none outline-none p-0 m-0',
            )}
            style={{ width: inputWidth ? `${inputWidth}px` : undefined }}
          />
          {/* Hidden sizer to measure text width */}
          <span
            ref={sizerRef}
            className={cn(segmentTextVariants({ variant }), 'invisible absolute whitespace-pre')}
            aria-hidden
          >
            {editText || ' '}
          </span>
        </>
      ) : (
        <p ref={textRef} className={segmentTextVariants({ variant })}>
          {children}
        </p>
      )}
    </div>
  );
};

Segment.displayName = 'Segment';
