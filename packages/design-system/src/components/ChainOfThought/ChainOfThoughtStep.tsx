import {
  type FC,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
  type TransitionEvent,
  useId,
  useState,
} from 'react';

import { ChevronDown, CircleDashed } from '../../icons';
import { cn } from '../../utils/cn';
import { Collapse } from '../../utils/Collapse';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import {
  chainOfThoughtBodyVariants,
  chainOfThoughtIconVariants,
  chainOfThoughtLabelVariants,
  chainOfThoughtLineVariants,
  chainOfThoughtMetricVariants,
  chainOfThoughtRowVariants,
  chainOfThoughtStepVariants,
} from './classes';

export interface ChainOfThoughtStepProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children'>, TestableProps {
  /**
   * `...rest`, `ref`, `className` and `data-testid` land on the ROW — a `<button>` when the
   * step has children or an `onClick` action, a `<div>` otherwise.
   */
  ref?: Ref<HTMLElement>;
  /** Row text: 'Searched for ABC', 'Working...', 'Thought for 5s', 'Worked for 3m 45s'. */
  label: ReactNode;
  /** 16px type icon. Default `<CircleDashed />`. `null` = Figma "Simple" row (no icon cell, no connector). */
  icon?: ReactNode;
  /** Right-aligned mono slot = Figma "Simple-result". */
  metric?: ReactNode;
  /**
   * `'running'` shimmers the label (Figma "Working"). `'error'` tints the label and icon danger
   * (not in Figma yet; pending design review) and prefixes a visually hidden "Error:" for screen
   * readers; still word the label so it reads as a failure ('get_attacks failed'). Default `'done'`.
   * Reflected in the `li`'s `data-status`. A step that mounts as `'running'` gets `data-entered`
   * and animates in (and fades its shimmer out on `'done'`); one mounted `'done'` renders static.
   */
  status?: 'running' | 'done' | 'error';
  /** Controlled open state of the nested content. */
  open?: boolean;
  /** Initial open state when uncontrolled. Default `false`. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Nested content (a nested `ChainOfThought`, text, inline code). Its presence makes the row a collapsible trigger. */
  children?: ReactNode;
}

const DEFAULT_ICON = <CircleDashed />;

export const ChainOfThoughtStep: FC<ChainOfThoughtStepProps> = ({
  ref,
  label,
  icon = DEFAULT_ICON,
  metric,
  status = 'done',
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  className,
  onClick,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('step', testIdProp);
  const contentId = useId();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  // Status at mount, frozen: a live step animates in; one loaded from history (`done`) does not.
  const [entered] = useState(status === 'running');
  // Once the shimmer has faded into the fill, drop to the static label classes: the overlay's
  // `color: transparent` + inherited fill would otherwise force every child of `label` to secondary.
  const [settled, setSettled] = useState(false);
  const labelEntered = entered && !(settled && status === 'done');
  const handleLabelTransitionEnd = (event: TransitionEvent<HTMLSpanElement>) => {
    if (
      status === 'done' &&
      event.target === event.currentTarget &&
      event.propertyName.endsWith('text-fill-color')
    )
      setSettled(true);
  };
  const isOpen = open ?? internalOpen;
  const collapsible = children != null && children !== false;
  const hasIcon = icon !== null;
  const interactive = collapsible || typeof onClick === 'function';

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || !collapsible) return;
    if (open === undefined) setInternalOpen(!isOpen);
    onOpenChange?.(!isOpen);
  };

  // TreeItemIcon trick: a closed collapsible row swaps its type icon for a chevron on hover/focus.
  const showTypeIcon = hasIcon && !(collapsible && isOpen);
  const iconCell = (showTypeIcon || collapsible) && (
    <span
      className={cn(chainOfThoughtIconVariants({ status }))}
      data-testid={testId && `${testId}--icon`}
    >
      {showTypeIcon && (
        <span
          className={cn(
            'inline-flex',
            collapsible && 'group-hover/row:hidden group-focus-visible/row:hidden',
          )}
        >
          {icon}
        </span>
      )}
      {collapsible && (
        // Wrapper owns display: `[&_svg]:icon-md` sets `display` on the svg itself and would beat `hidden`.
        <span
          className={cn(
            'inline-flex transition-transform motion-reduce:transition-none',
            !isOpen && '-rotate-90',
            showTypeIcon &&
              'hidden group-hover/row:inline-flex group-focus-visible/row:inline-flex',
          )}
        >
          <ChevronDown />
        </span>
      )}
    </span>
  );

  const rowContent = (
    <>
      {iconCell}
      {/* Color alone must not carry the failure (WCAG 1.4.1). */}
      {status === 'error' && <span className='sr-only'>Error: </span>}
      <span
        className={chainOfThoughtLabelVariants({ status, entered: labelEntered })}
        onTransitionEnd={labelEntered ? handleLabelTransitionEnd : undefined}
      >
        {label}
      </span>
      {metric != null && <span className={chainOfThoughtMetricVariants()}>{metric}</span>}
    </>
  );

  const rowProps = {
    ...props,
    // Same node either way; the row is a <button> or a <div>, both HTMLElements.
    ref: ref as Ref<HTMLButtonElement & HTMLDivElement>,
    'data-slot': 'chain-of-thought-step-row',
    'data-testid': testId,
    className: cn(chainOfThoughtRowVariants({ interactive }), className),
  };

  return (
    <li
      data-slot='chain-of-thought-step'
      data-status={status}
      data-entered={entered || undefined}
      data-state={collapsible && isOpen ? 'open' : 'closed'}
      className={chainOfThoughtStepVariants({ simple: !hasIcon, entered })}
    >
      {interactive ? (
        <button
          {...rowProps}
          type='button'
          aria-expanded={collapsible ? isOpen : undefined}
          aria-controls={collapsible ? contentId : undefined}
          onClick={handleClick}
        >
          {rowContent}
        </button>
      ) : (
        <div {...rowProps}>{rowContent}</div>
      )}
      {showTypeIcon && (
        <span
          aria-hidden
          data-slot='chain-of-thought-connector'
          data-testid={testId && `${testId}--connector`}
          className={cn(chainOfThoughtLineVariants({ entered }), 'h-20')}
        />
      )}
      {collapsible && (
        <Collapse
          id={contentId}
          open={isOpen}
          inertWhenClosed
          data-slot='chain-of-thought-step-content'
        >
          <div className='flex'>
            <span aria-hidden className={chainOfThoughtLineVariants()} />
            <div className={chainOfThoughtBodyVariants()}>
              <TestIdProvider value={testId}>{children}</TestIdProvider>
            </div>
          </div>
        </Collapse>
      )}
    </li>
  );
};

ChainOfThoughtStep.displayName = 'ChainOfThoughtStep';
