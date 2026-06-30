import type {
  FC,
  FocusEvent,
  HTMLAttributes,
  KeyboardEvent,
  MutableRefObject,
  ReactNode,
  Ref,
} from 'react';
import { useCallback, useEffect, useRef } from 'react';
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
  const divRef = useRef<HTMLDivElement | null>(null);
  // Capture selectOnFocus in a ref so the mount-only effect reads the value at mount time
  // without needing it in the dependency array.
  const selectOnFocusRef = useRef(selectOnFocus);
  selectOnFocusRef.current = selectOnFocus;

  // Focus the first focusable descendant each time editing begins.
  // Depends on `editing` so it re-runs whenever the user clicks to edit,
  // not just on the initial component mount (when editing may be false).
  useEffect(() => {
    if (!editing) return;
    const node = divRef.current;
    if (!node) return;
    const focusable = node.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!focusable) return;
    focusable.focus();
    if (
      selectOnFocusRef.current &&
      (focusable instanceof HTMLInputElement || focusable instanceof HTMLTextAreaElement)
    ) {
      focusable.select();
    }
  }, [editing]);

  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      divRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [ref],
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
      ref={combinedRef}
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
