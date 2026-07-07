import type {
  FC,
  HTMLAttributes,
  KeyboardEvent,
  PointerEvent,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import { Children, isValidElement, useRef } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Tooltip, TooltipContent, type TooltipProps, TooltipTrigger } from '../Tooltip';
import { inlineEditPreviewVariants } from './classes';
import { useInlineEdit } from './InlineEditContext';
import { InlineEditPreviewIcon } from './InlineEditPreviewIcon';
import { InlineEditPreviewValue, type InlineEditPreviewValueProps } from './InlineEditPreviewValue';

const isInlineEditPreviewValue = (
  child: ReactNode,
): child is ReactElement<InlineEditPreviewValueProps> =>
  isValidElement(child) &&
  (child.type as { displayName?: string })?.displayName === InlineEditPreviewValue.displayName;

const isInlineEditPreviewIcon = (child: ReactNode): boolean =>
  isValidElement(child) &&
  (child.type as { displayName?: string })?.displayName === InlineEditPreviewIcon.displayName;

export interface InlineEditPreviewProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /**
   * Tooltip shown on hover/focus while the value is editable. Defaults to
   * `'Edit'`. Pass `null` to disable the tooltip.
   */
  tooltip?: ReactNode;
  /**
   * Clamp the read-mode value to this many lines (with an ellipsis) instead of
   * the default single-line truncation. Use for multi-line values (textarea).
   * Applies to the default (no-parts) composition; when composing
   * `InlineEditPreviewValue` explicitly, set `lineClamp` on it directly.
   */
  lineClamp?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Plain content auto-wraps into `InlineEditPreviewValue` + a default
   * `InlineEditPreviewIcon` (pencil). Compose `InlineEditPreviewValue`/
   * `InlineEditPreviewIcon` explicitly for a custom trailing icon.
   */
  children?: ReactNode;
}

export const InlineEditPreview: FC<InlineEditPreviewProps> = ({
  ref,
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

  const childArray = Children.toArray(children);
  const valueChild = childArray.find(isInlineEditPreviewValue);
  const hasExplicitParts = childArray.some(
    child => isInlineEditPreviewValue(child) || isInlineEditPreviewIcon(child),
  );
  // Alignment (multiline vs single-line) is a root-level CSS decision
  // regardless of composition — read it off the composed Value's own prop
  // when explicit, else fall back to this component's own `lineClamp`.
  const effectiveLineClamp = hasExplicitParts ? valueChild?.props.lineClamp : lineClamp;

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
          multiline: Boolean(effectiveLineClamp),
          activatable,
          invalid: activatable && invalid,
        }),
        className,
      )}
    >
      {hasExplicitParts ? (
        children
      ) : (
        <>
          <InlineEditPreviewValue lineClamp={lineClamp}>{children}</InlineEditPreviewValue>
          <InlineEditPreviewIcon />
        </>
      )}
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
