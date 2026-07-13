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

// `:not([tabindex="-1"])` must qualify every clause individually, not just
// the generic `[tabindex]` catch-all — Ark UI's Select renders a hidden,
// `aria-hidden`, `tabindex="-1"` native `<select>` mirror (for native form
// submission) that sits earlier in DOM order than the real trigger button.
// An unqualified bare `select` clause matches it first, silently focusing
// an invisible element instead of the actual editor.
const FOCUSABLE_SELECTOR =
  'input:not([tabindex="-1"]), textarea:not([tabindex="-1"]), select:not([tabindex="-1"]), button:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])';

// InlineEditSelect opens via `defaultOpen`, which initializes Ark's Select
// machine directly in the `open` state rather than transitioning into it —
// so `setInitialFocus` (a transition action, tied to events like
// TRIGGER.CLICK) never runs, and nothing ever focuses the listbox on its
// own. Left to FOCUSABLE_SELECTOR, focus lands on the trigger button
// instead (earlier in DOM order) — which silently breaks Arrow-key
// navigation, since the trigger's own key handler always sends
// TRIGGER.ARROW_DOWN, and the machine's `open` state has no transition for
// that event, only for CONTENT.ARROW_DOWN (dispatched by the listbox's own
// handler). SelectContent renders through a portal (verified: not a DOM
// descendant of this component at all, floating content typically mounts
// under <body>), so it can't be found by scoping a querySelector to this
// component's own subtree — resolve it via the trigger's `aria-controls`,
// the same id/aria-controls pairing screen readers rely on.
function findOpenListbox(focusable: HTMLElement): HTMLElement | null {
  const controlsId = focusable.getAttribute('aria-controls');
  if (!controlsId) return null;
  const controlled = document.getElementById(controlsId);
  return controlled?.getAttribute('role') === 'listbox' ? controlled : null;
}

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

  // Focus the first focusable descendant each time editing begins — unless
  // it controls an already-open listbox (see findOpenListbox above), which
  // takes focus instead.
  // Depends on `editing` so it re-runs whenever the user clicks to edit,
  // not just on the initial component mount (when editing may be false).
  useEffect(() => {
    if (!editing) return;
    const node = divRef.current;
    if (!node) return;
    const firstFocusable = node.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!firstFocusable) return;
    const focusable = findOpenListbox(firstFocusable) ?? firstFocusable;
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
        // The -7px left offset that matches InlineEditPreview's hit target
        // comes from AttributeValue (InlineEdit is only ever hosted inside
        // it — see AttributeValue's InlineEdit hosting seam), not from this
        // component, so toggling preview <-> edit doesn't shift anything.
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
