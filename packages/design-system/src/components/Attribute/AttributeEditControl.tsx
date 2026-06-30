import type { FC, FocusEvent, HTMLAttributes, KeyboardEvent, ReactNode, Ref } from 'react';
import { useCallback } from 'react';
import { composeRefs } from '@radix-ui/react-compose-refs';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useAttributeEdit } from './AttributeEditContext';

const FOCUSABLE_SELECTOR = 'input, textarea, select, button, [tabindex]:not([tabindex="-1"])';

export interface AttributeEditControlProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const AttributeEditControl: FC<AttributeEditControlProps> = ({
  ref,
  children,
  className,
  onKeyDown,
  onBlur,
  ...props
}) => {
  const testId = useTestId('edit-control');
  const { editing, submitMode, selectOnFocus, submit, cancel } = useAttributeEdit();

  // Focus the first focusable descendant when the control mounts (edit start).
  const focusRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      const focusable = node.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (!focusable) return;
      focusable.focus();
      if (
        selectOnFocus &&
        (focusable instanceof HTMLInputElement || focusable instanceof HTMLTextAreaElement)
      ) {
        focusable.select();
      }
    },
    [selectOnFocus],
  );

  if (!editing) return null;

  const submitsOnEnter = submitMode === 'enter' || submitMode === 'both';
  const submitsOnBlur = submitMode === 'blur' || submitMode === 'both';

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
      return;
    }
    if (event.key === 'Enter' && submitsOnEnter) {
      const target = event.target as HTMLElement;
      const isTextarea = target.tagName === 'TEXTAREA';
      if (isTextarea && !event.metaKey && !event.ctrlKey) return; // allow newline
      event.preventDefault();
      submit();
    }
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    onBlur?.(event);
    if (event.defaultPrevented) return;
    // Ignore focus moves that stay inside the control.
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    if (submitsOnBlur) submit();
    else cancel();
  };

  return (
    <div
      {...props}
      ref={composeRefs(ref, focusRef)}
      data-testid={testId}
      data-slot='attribute-edit-control'
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={cn('w-full min-w-0', className)}
    >
      {children}
    </div>
  );
};

AttributeEditControl.displayName = 'AttributeEditControl';
