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
import {
  type InlineEditContextValue,
  type InlineEditSubmitMode,
  useInlineEdit,
} from './InlineEditContext';

const FOCUSABLE_SELECTOR = 'input, textarea, select, button, [tabindex]:not([tabindex="-1"])';

export interface InlineEditControlProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  ref?: Ref<HTMLDivElement>;
  /**
   * Explicit render-time submit mode for this editor session. Highest
   * precedence (beats editor registrations and the root prop) — the escape
   * hatch for custom editors that cannot call useInlineEditSubmitMode.
   */
  submitMode?: InlineEditSubmitMode;
  /** Function children receive the inline-edit context (render-prop). */
  children?: ReactNode | ((ctx: InlineEditContextValue) => ReactNode);
}

export const InlineEditControl: FC<InlineEditControlProps> = ({
  ref,
  children,
  className,
  onKeyDown,
  onBlur,
  submitMode: submitModeProp,
  ...props
}) => {
  const testId = useTestId('control');
  const ctx = useInlineEdit();
  const { editing, selectOnFocus, submit, cancel } = ctx;
  const submitMode = submitModeProp ?? ctx.submitMode;
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
    // zag's dismissable layer preventDefaults Escape when closing a popover — this skip is
    // what keeps Escape-close from also cancelling the edit. Load-bearing; do not remove.
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
    // `none`: the editor commits through its own events (e.g. a select/calendar
    // closing) — blur must NOT cancel, or it would revert that committed value.
    if (submitsOnBlur) submit();
    else if (submitMode !== 'none') cancel();
  };

  return (
    <div
      {...props}
      ref={combinedRef}
      data-testid={testId}
      data-slot='inline-edit-control'
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={cn('w-full min-w-0', className)}
    >
      {typeof children === 'function' ? children(ctx) : children}
    </div>
  );
};

InlineEditControl.displayName = 'InlineEditControl';
