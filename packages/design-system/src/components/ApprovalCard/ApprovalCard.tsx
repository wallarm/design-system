import {
  type FC,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useEffect,
  useId,
  useRef,
} from 'react';

import { Check, X } from '../../icons';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import {
  approvalCardCaptionVariants,
  approvalCardStatusIconVariants,
  approvalCardSurfaceVariants,
  approvalCardVariants,
} from './classes';

export type ApprovalCardStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalCardProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Pending shows `children` (content + actions); resolved states replace them with a status row. */
  status?: ApprovalCardStatus;
  /** Shown above the card in every state. Pass `null` to hide it. */
  caption?: ReactNode;
  approvedLabel?: ReactNode;
  rejectedLabel?: ReactNode;
}

interface PartProps extends HTMLAttributes<HTMLDivElement> {
  slot: string;
  ref?: Ref<HTMLDivElement>;
}

/** Internal part that derives its test id from the card's cascade. */
const Part: FC<PartProps> = ({ slot, ...props }) => (
  <div {...props} data-testid={useTestId(slot)} />
);

export const ApprovalCard: FC<ApprovalCardProps> = ({
  ref,
  status = 'pending',
  caption = 'Requires your approval',
  approvedLabel = 'Approved',
  rejectedLabel = 'Rejected',
  className,
  children,
  'data-testid': testIdProp,
  onFocus,
  onBlur,
  ...props
}) => {
  const testId = useTestId('approval-card', testIdProp);
  const captionId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const prevStatus = useRef(status);
  // Tracked via React focus events: React ignores the blur a node fires while it is removed
  // during commit, so this stays true when the focused action unmounts on resolve.
  const focusWithin = useRef(false);
  const StatusIcon = status === 'approved' ? Check : X;
  const hasCaption = caption != null && caption !== false && caption !== '';
  const labelledBy =
    hasCaption && !props['aria-label'] && !props['aria-labelledby'] ? captionId : undefined;

  // Resolving unmounts the focused action button; hand focus to the status row instead of
  // letting it fall to <body>. Only when focus was in the card, so a host-driven resolve never
  // steals focus or scrolls the chat log.
  useEffect(() => {
    const wasPending = prevStatus.current === 'pending';
    prevStatus.current = status;
    if (!wasPending || status === 'pending' || !focusWithin.current) return;
    const active = document.activeElement;
    if (!active || active === document.body || rootRef.current?.contains(active)) {
      statusRef.current?.focus({ preventScroll: true });
    }
  }, [status]);

  return (
    <div
      role='group'
      aria-labelledby={labelledBy}
      {...props}
      ref={mergeRefs(ref, rootRef)}
      onFocus={e => {
        focusWithin.current = true;
        onFocus?.(e);
      }}
      onBlur={e => {
        focusWithin.current = e.currentTarget.contains(e.relatedTarget);
        onBlur?.(e);
      }}
      data-slot='approval-card'
      data-status={status}
      data-testid={testId}
      className={cn(approvalCardVariants(), className)}
    >
      <TestIdProvider value={testId}>
        {hasCaption && (
          <Part
            slot='caption'
            id={captionId}
            data-slot='approval-card-caption'
            className={approvalCardCaptionVariants()}
          >
            {caption}
          </Part>
        )}
        {status === 'pending' && (
          <Part
            slot='surface'
            data-slot='approval-card-surface'
            className={approvalCardSurfaceVariants({ status })}
          >
            {children}
          </Part>
        )}
        {/* Always mounted so screen readers pick up the change when the label is inserted. */}
        <div role='status'>
          {status !== 'pending' && (
            <Part
              slot='status'
              ref={statusRef}
              tabIndex={-1}
              data-slot='approval-card-status'
              className={cn(approvalCardSurfaceVariants({ status }), 'outline-none')}
            >
              <StatusIcon size='md' className={approvalCardStatusIconVariants({ status })} />
              {status === 'approved' ? approvedLabel : rejectedLabel}
            </Part>
          )}
        </div>
      </TestIdProvider>
    </div>
  );
};

ApprovalCard.displayName = 'ApprovalCard';
