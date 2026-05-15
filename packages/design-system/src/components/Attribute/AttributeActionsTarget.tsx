import type { FC, HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { DropdownMenuTrigger } from '../DropdownMenu';

// Descendants matching this selector are nested interactive zones — clicks on
// them run their own behavior and do not open the dropdown.
// `[aria-haspopup]` covers Ark UI / Radix popover, menu and dialog triggers
// composed via Slot (asChild) — they don't always carry role="button" but
// always set aria-haspopup. Self-match is filtered by `match !== currentTarget`
// because Zag's Menu.Trigger sets aria-haspopup on this same div.
// `[data-attribute-actions-skip]` is an internal escape hatch (not public API).
const INTERACTIVE_SELECTOR = [
  'a[href]',
  'button',
  '[role="button"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="menuitemradio"]',
  '[role="menuitemcheckbox"]',
  '[role="checkbox"]',
  '[role="switch"]',
  '[role="tab"]',
  'input',
  'select',
  'textarea',
  '[contenteditable="true"]',
  '[aria-haspopup]',
  '[data-attribute-actions-skip]',
  '[data-slot="inline-code-snippet"]',
].join(',');

const isFromInternalInteractive = (
  event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
): boolean => {
  const target = event.target;
  if (!(target instanceof Element)) return false;
  const match = target.closest(INTERACTIVE_SELECTOR);
  return match !== null && match !== event.currentTarget;
};

export interface AttributeActionsTargetProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
  /**
   * When true, descendants are rendered `inert` — they cannot be clicked,
   * focused, or read by assistive tech as actionable. Any interaction with the
   * target (mouse or keyboard) opens the AttributeActions dropdown.
   *
   * Default `false` — descendants keep their own behavior; clicking them does
   * not open the dropdown. The dropdown opens only when the surrounding target
   * area is clicked.
   */
  disableNestedInteractive?: boolean;
}

export const AttributeActionsTarget: FC<AttributeActionsTargetProps> = ({
  ref,
  children,
  className,
  onClick,
  onKeyDown,
  disableNestedInteractive = false,
  ...props
}) => {
  const testId = useTestId('target');

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (disableNestedInteractive) return;
    if (isFromInternalInteractive(event)) {
      event.preventDefault();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (disableNestedInteractive) return;
    if ((event.key === 'Enter' || event.key === ' ') && isFromInternalInteractive(event)) {
      event.preventDefault();
    }
  };

  return (
    <DropdownMenuTrigger asChild>
      <div
        {...props}
        ref={ref}
        data-testid={testId}
        data-slot='attribute-actions-target'
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          // `min-w-0` lets the target shrink below its content size — without
          // it, flex children fall back to `min-width: auto` (content-based),
          // so width-aware descendants (e.g. `IpList type="horizontal"`,
          // `OverflowList`) read a content-derived width and never re-measure
          // when the surrounding column shrinks.
          '-my-4 flex w-full min-w-0 cursor-pointer items-center rounded-8 px-6 py-4 transition-colors',
          'hover:bg-states-primary-hover active:bg-states-primary-pressed',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
          className,
        )}
      >
        <div className='contents' inert={disableNestedInteractive || undefined}>
          {children}
        </div>
      </div>
    </DropdownMenuTrigger>
  );
};

AttributeActionsTarget.displayName = 'AttributeActionsTarget';
