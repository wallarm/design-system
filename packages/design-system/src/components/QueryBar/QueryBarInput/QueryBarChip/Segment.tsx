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

  // Continuously measure text width while not editing
  useEffect(() => {
    if (editing || !textRef.current) return;
    lastTextWidthRef.current = textRef.current.offsetWidth;
  });

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (!editing) return;
    // Use double rAF to beat Ark UI focus steal
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    });
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
