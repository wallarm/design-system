import type { FC, HTMLAttributes, KeyboardEvent, PointerEvent, ReactNode, Ref } from 'react';
import { useRef } from 'react';
import { Check, Pencil } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Loader } from '../Loader';
import { Tooltip, TooltipContent, type TooltipProps, TooltipTrigger } from '../Tooltip';
import { useAttributeEdit } from './AttributeEditContext';

export interface AttributeEditPreviewProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Trailing affordance icon shown on hover/focus in read mode. */
  triggerIcon?: ReactNode;
  /**
   * Tooltip shown on hover/focus while the value is editable. Defaults to
   * `'Edit'`. Pass `null` to disable the tooltip.
   */
  tooltip?: ReactNode;
  children?: ReactNode;
}

export const AttributeEditPreview: FC<AttributeEditPreviewProps> = ({
  ref,
  triggerIcon = <Pencil size='md' />,
  tooltip = 'Edit',
  children,
  className,
  onClick,
  onFocus,
  onKeyDown,
  onPointerMove,
  ...props
}) => {
  const testId = useTestId('edit-preview');
  const { editing, status, invalid, disabled, readOnly, activationMode, edit } = useAttributeEdit();

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
    offset: { mainAxis: 12, crossAxis: 8 },
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
      data-slot='attribute-edit-preview'
      role={activatable ? 'button' : undefined}
      tabIndex={activatable ? 0 : undefined}
      onClick={handleClick}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onPointerMove={handlePointerMove}
      className={cn(
        'group -my-4 flex w-full min-w-0 items-center gap-4 rounded-8 border border-transparent px-6 py-4 transition-colors',
        // Editable, no error: neutral hover background + primary focus ring.
        activatable &&
          !invalid &&
          'cursor-pointer hover:bg-states-primary-hover active:bg-states-primary-pressed focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
        // Editable with an error: hover/focus reveal the destructive text-box border + ring.
        activatable &&
          invalid &&
          'cursor-pointer bg-component-input-bg hover:border-border-strong-danger hover:ring-3 hover:ring-focus-destructive focus-visible:border-border-strong-danger focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-destructive',
        className,
      )}
    >
      <span className={cn('min-w-0 flex-1 truncate', isLoading && 'opacity-50')}>{children}</span>
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

AttributeEditPreview.displayName = 'AttributeEditPreview';
