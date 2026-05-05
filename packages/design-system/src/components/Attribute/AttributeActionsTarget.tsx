import type { FC, HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { DropdownMenuTrigger } from '../DropdownMenu';

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
  '[data-attribute-actions-skip]',
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
}

export const AttributeActionsTarget: FC<AttributeActionsTargetProps> = ({
  ref,
  children,
  className,
  onClick,
  onKeyDown,
  ...props
}) => {
  const testId = useTestId('target');

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (isFromInternalInteractive(event)) {
      event.preventDefault();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
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
          '-mx-4 -my-4 flex w-full cursor-pointer items-center rounded-8 px-6 py-4 transition-colors',
          'hover:bg-states-primary-hover active:bg-states-primary-pressed',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
          className,
        )}
      >
        {children}
      </div>
    </DropdownMenuTrigger>
  );
};

AttributeActionsTarget.displayName = 'AttributeActionsTarget';
