import type { FC, HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode, Ref } from 'react';
import { useMenuContext } from '@ark-ui/react/menu';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { DropdownMenuTrigger } from '../DropdownMenu';

// Descendants matching this selector are nested interactive zones — clicks on
// them run their own behavior and do not open the dropdown.
// `data-attribute-actions-skip` is an internal escape hatch (not public API).
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
   * When true, clicks/keydown on nested interactive descendants (links, buttons,
   * InlineCodeSnippet, etc.) are intercepted: their own handlers do not run and
   * only the AttributeActions dropdown opens.
   *
   * Default `false` — only the descendant's behavior fires; the dropdown stays
   * closed when interacting with the descendant directly, and opens only when
   * clicking the surrounding target area.
   */
  disableNestedInteractive?: boolean;
}

export const AttributeActionsTarget: FC<AttributeActionsTargetProps> = ({
  ref,
  children,
  className,
  onClick,
  onKeyDown,
  onKeyDownCapture,
  disableNestedInteractive = false,
  ...props
}) => {
  const testId = useTestId('target');
  const menu = useMenuContext();

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

  const handleKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDownCapture?.(event);
    if (event.defaultPrevented) return;
    if (!disableNestedInteractive) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (!isFromInternalInteractive(event)) return;
    event.preventDefault();
    event.stopPropagation();
    menu.setOpen(true);
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
        onKeyDownCapture={handleKeyDownCapture}
        className={cn(
          '-my-4 flex w-full cursor-pointer items-center rounded-8 px-6 py-4 transition-colors',
          'hover:bg-states-primary-hover active:bg-states-primary-pressed',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
          disableNestedInteractive && '[&_*]:pointer-events-none',
          className,
        )}
      >
        {children}
      </div>
    </DropdownMenuTrigger>
  );
};

AttributeActionsTarget.displayName = 'AttributeActionsTarget';
