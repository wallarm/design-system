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
  const { editing, selectOnFocus, submit, cancel, isCommitPending } = ctx;
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
    // A pending commit guard owns the session: focus moving to the consumer's
    // confirmation dialog is incidental — it must neither submit nor cancel.
    if (isCommitPending()) return;
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
      className={cn(
        'w-full min-w-0',
        // Matches InlineEditPreview's own -ml-7: the hover-row hit target
        // (and, here, the composed controls' own padding, per the rules
        // below) extends 7px further left than surrounding content, in both
        // modes, so toggling preview <-> edit doesn't shift anything.
        '-ml-7',
        // Horizontal padding matches InlineEditPreview's 6px (px-6) on both
        // sides so toggling between preview and edit mode causes no
        // horizontal text jump. Descendant selectors, not a shared prop:
        // Input is the only one of these that exposes a className merge
        // point all the way down to the padded element — NumberInput/
        // Textarea deliberately omit `className`, and SelectButton/
        // DateInput's own overridable slot sits outside the padded element.
        // Higher specificity than each target's own `px-*` utility wins
        // regardless of class order — same technique InputGroup already
        // uses to override Input's classes (InputGroup.tsx's
        // `**:data-[slot=input]:...`).
        '[&_[data-slot=input]]:px-6', // Input
        '[&_textarea]:px-6', // Textarea
        '[&_[data-scope=number-input][data-part=input]]:px-6', // NumberInput
        // Matches any Select trigger style — Ark UI's `asChild` stamps
        // `data-scope=select][data-part=trigger]` onto whichever element is
        // composed as the trigger, so this also covers SelectButtonTag
        // (Tag-rendered trigger), not just the default Button-rendered one.
        '[&_[data-scope=select][data-part=trigger]]:px-6', // SelectButton / SelectButtonTag / SelectInput
        // SelectInput's multi-select/tags case (`data-slot=overflow-list`)
        // already gets 6px from OverflowList's own `pl-6` — the rule above
        // would double it up, so this more specific selector wins for the
        // left side only (higher specificity: extra `div` + `:has()`).
        '[&_div[data-scope=select][data-part=trigger]:has([data-slot=overflow-list])]:pl-0',
        '[&_[data-slot=input-group-addon]]:px-6', // DateInput/TimeInput icon addon (when shown)
        // DateInput/TimeInput with `showIcon={false}` (InlineEdit's own
        // usage): no addon renders, and DateInputInternal puts `pl-12`
        // directly on the segment-group wrapper (no data-slot of its own —
        // matched here as the input-group's first child with no data-slot
        // at all, to avoid also matching the addon case above). Segments
        // sit flush left instead of matching InlineEditPreview's 6px.
        '[&_[data-slot=input-group]>div:not([data-slot])]:pl-0',
        className,
      )}
    >
      {typeof children === 'function' ? children(ctx) : children}
    </div>
  );
};

InlineEditControl.displayName = 'InlineEditControl';
