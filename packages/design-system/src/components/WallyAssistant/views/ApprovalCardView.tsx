import type { FC, ReactNode } from 'react';
import { ChevronDown } from '../../../icons';
import { useTestId } from '../../../utils/testId';
import {
  ApprovalCard,
  ApprovalCardActions,
  ApprovalCardContent,
  type ApprovalCardProps,
} from '../../ApprovalCard';
import { Button } from '../../Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../DropdownMenu';
import { SplitButton } from '../../SplitButton';
import type { ChatLabels } from '../model/labels';
import type {
  ChatApprovalOption,
  ChatApprovalPart,
  ChatApprovalResponse,
  ChatMessage,
} from '../model/model';
import { MarkdownView, useChatView } from './ChatViewContext';

export interface ApprovalCardViewProps extends Omit<
  ApprovalCardProps,
  'status' | 'children' | 'caption' | 'approvedLabel' | 'rejectedLabel'
> {
  approval: ChatApprovalPart;
  message?: ChatMessage;
  /** Default: the provider's onApprovalRespond. Absent → buttons disabled. */
  onRespond?: (response: ChatApprovalResponse) => void;
  /** ORed with `approval.disabled`; ChatPartView sets it for approvals in older messages. */
  disabled?: boolean;
  /** Replaces the default option buttons: render your own ApprovalCardActions (the analytics seam).
   *  undefined = the defaults; null = no actions. */
  children?: ReactNode;
}

const defaultOptions = (labels: ChatLabels): readonly ChatApprovalOption[] => [
  { id: 'allow-always', kind: 'allow-always', label: labels.approvalAllowAlways },
  { id: 'allow-once', kind: 'allow-once', label: labels.approvalAllowOnce },
  { id: 'reject', kind: 'reject', label: labels.approvalReject },
];

const MENU_POSITIONING = { placement: 'bottom-end' } as const;

interface DefaultActionsProps {
  options: readonly ChatApprovalOption[];
  disabled: boolean;
  moreLabel: string;
  onSelect: (option: ChatApprovalOption) => void;
}

/** Figma 182:4099: the first non-reject option is primary, the other non-reject ones go into its
 *  SplitButton menu, reject options are secondary. Ids: `<card>--option-{id}`, `<card>--more`. */
const DefaultActions: FC<DefaultActionsProps> = ({ options, disabled, moreLabel, onSelect }) => {
  const base = useTestId();
  const idOf = (slot: string) => (base ? `${base}--${slot}` : undefined);
  const [primary, ...more] = options.filter(o => o.kind !== 'reject');
  const rejects = options.filter(o => o.kind === 'reject');

  const primaryButton = primary && (
    <Button
      disabled={disabled}
      data-testid={idOf(`option-${primary.id}`)}
      onClick={() => onSelect(primary)}
    >
      {primary.label}
    </Button>
  );

  return (
    <ApprovalCardActions>
      {more.length ? (
        <DropdownMenu positioning={MENU_POSITIONING}>
          <SplitButton>
            {primaryButton}
            <DropdownMenuTrigger asChild data-testid={idOf('more')}>
              <Button aria-label={moreLabel} disabled={disabled}>
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
          </SplitButton>
          <DropdownMenuContent>
            {more.map(option => (
              <DropdownMenuItem
                key={option.id}
                disabled={disabled}
                data-testid={idOf(`option-${option.id}`)}
                onSelect={() => onSelect(option)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        primaryButton
      )}
      {rejects.map(option => (
        <Button
          key={option.id}
          variant='secondary'
          color='neutral'
          disabled={disabled}
          data-testid={idOf(`option-${option.id}`)}
          onClick={() => onSelect(option)}
        >
          {option.label}
        </Button>
      ))}
    </ApprovalCardActions>
  );
};

/**
 * One `approval` part as an `ApprovalCard`: the caption, `content` through `markdown`, then the
 * default option buttons (or your `children`). The answer leaves through `onRespond` or the
 * provider's `onApprovalRespond`; the resolved status arrives in the next snapshot.
 */
export const ApprovalCardView: FC<ApprovalCardViewProps> = ({
  approval,
  message,
  onRespond,
  disabled = false,
  children,
  ...props
}) => {
  const { labels, handlers, hasApprovalRespond } = useChatView();
  const canRespond = onRespond != null || hasApprovalRespond;

  const respond = (option: ChatApprovalOption) => {
    const response: ChatApprovalResponse = {
      approvalId: approval.id,
      optionId: option.id,
      kind: option.kind,
      approved: option.kind !== 'reject',
    };
    if (onRespond) onRespond(response);
    else handlers.current.onApprovalRespond?.(response, approval);
  };

  return (
    <ApprovalCard
      {...props}
      status={approval.status}
      caption={labels.approvalCaption}
      approvedLabel={approval.resolvedLabel || labels.approved}
      rejectedLabel={approval.resolvedLabel || labels.rejected}
    >
      <ApprovalCardContent>
        <MarkdownView
          text={approval.content}
          streaming={false}
          variant='approval'
          messageId={message?.id}
          partId={approval.id}
        />
      </ApprovalCardContent>
      {children !== undefined ? (
        children
      ) : (
        <DefaultActions
          options={approval.options?.length ? approval.options : defaultOptions(labels)}
          disabled={disabled || !!approval.disabled || !canRespond}
          moreLabel={labels.approvalMoreOptions}
          onSelect={respond}
        />
      )}
    </ApprovalCard>
  );
};

ApprovalCardView.displayName = 'ApprovalCardView';
