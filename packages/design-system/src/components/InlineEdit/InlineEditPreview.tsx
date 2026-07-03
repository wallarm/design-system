import type { FC, HTMLAttributes, KeyboardEvent, PointerEvent, ReactNode, Ref } from 'react';
import { useRef } from 'react';
import { Check, Pencil } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Loader } from '../Loader';
import { Tooltip, TooltipContent, type TooltipProps, TooltipTrigger } from '../Tooltip';
import { inlineEditPreviewVariants } from './classes';
import { useInlineEdit } from './InlineEditContext';

// Literal classes so Tailwind can statically detect them.
const LINE_CLAMP_CLASS: Record<number, string> = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
  5: 'line-clamp-5',
  6: 'line-clamp-6',
};

export interface InlineEditPreviewProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Trailing affordance icon shown on hover/focus in read mode. */
  triggerIcon?: ReactNode;
  /**
   * Tooltip shown on hover/focus while the value is editable. Defaults to
   * `'Edit'`. Pass `null` to disable the tooltip.
   */
  tooltip?: ReactNode;
  /**
   * Clamp the read-mode value to this many lines (with an ellipsis) instead of
   * the default single-line truncation. Use for multi-line values (textarea).
   */
  lineClamp?: 1 | 2 | 3 | 4 | 5 | 6;
  children?: ReactNode;
}

export const InlineEditPreview: FC<InlineEditPreviewProps> = ({
  ref,
  triggerIcon = <Pencil size='md' />,
  tooltip = 'Edit',
  lineClamp,
  children,
  className,
  onClick,
  onFocus,
  onKeyDown,
  onPointerMove,
  ...props
}) => {
  const testId = useTestId('preview');
  const { editing, status, invalid, disabled, readOnly, activationMode, edit } = useInlineEdit();

  // Last pointer position, used to anchor the tooltip under the cursor.
  const pointerRef = useRef({ x: 0, y: 0 });

  if (editing) return null;

  // While a commit is in flight the field is inert: no hover, no trigger, no
  // tooltip, not clickable — just the dimmed value and a spinner.
  const isLoading = status === 'loading';
  const activatable = !disabled && !readOnly && !isLoading && activationMode !== 'none';

  const handleClick: HTMLAttributes<HTMLDivElement>['onClick'] = event => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (activatable && activationMode === 'click') edit();
  };

  const handleFocus: HTMLAttributes<HTMLDivElement>['onFocus'] = event => {
    onFocus?.(event);
    if (event.defaultPrevented) return;
    if (activatable && activationMode === 'focus') edit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (activatable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      edit();
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    pointerRef.current = { x: event.clientX, y: event.clientY };
  };

  // Anchor the tooltip to the cursor position (resolved when it opens) so the
  // "Edit" hint appears under the pointer rather than centered on the row.
  const tooltipPositioning: TooltipProps['positioning'] = {
    placement: 'bottom-start',
    // Clear the ~16-20px pointer-cursor graphic, leaving a small gap below it.
    offset: { mainAxis: 24, crossAxis: 0 },
    getAnchorRect: () => ({
      x: pointerRef.current.x,
      y: pointerRef.current.y,
      width: 0,
      height: 0,
    }),
  };

  const target = (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='inline-edit-preview'
      role={activatable ? 'button' : undefined}
      tabIndex={activatable ? 0 : undefined}
      onClick={handleClick}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onPointerMove={handlePointerMove}
      className={cn(
        inlineEditPreviewVariants({
          multiline: Boolean(lineClamp),
          activatable,
          invalid: activatable && invalid,
        }),
        className,
      )}
    >
      <span
        className={cn(
          'min-w-0 flex-1',
          lineClamp ? LINE_CLAMP_CLASS[lineClamp] : 'truncate',
          isLoading && 'opacity-50',
        )}
      >
        {children}
      </span>
      {isLoading ? (
        <Loader type='circle' size='md' />
      ) : status === 'saved' ? (
        <Check size='md' className='text-icon-success' />
      ) : activatable ? (
        <span className='text-icon-secondary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'>
          {triggerIcon}
        </span>
      ) : null}
    </div>
  );

  // Show the "Edit" hint only while the value is actually editable.
  if (activatable && tooltip != null) {
    return (
      <Tooltip positioning={tooltipPositioning}>
        <TooltipTrigger asChild>{target}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return target;
};

InlineEditPreview.displayName = 'InlineEditPreview';
