import type { ButtonHTMLAttributes, FC, MouseEvent, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { userMessageShowMoreVariants } from './classes';
import { useUserMessageBubbleContext } from './UserMessageContext';

export interface UserMessageShowMoreProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children'>, TestableProps {
  ref?: Ref<HTMLButtonElement>;
  /** Label while the text is clamped. */
  showMoreLabel?: ReactNode;
  /** Label while the text is expanded. */
  showLessLabel?: ReactNode;
}

/**
 * Toggles the bubble's clamp. Rendered by `UserMessageBubble` by default; pass your own
 * instance through its `showMore` prop. Renders nothing outside a bubble. The consumer
 * `onClick` runs first; `event.preventDefault()` cancels the toggle.
 */
export const UserMessageShowMore: FC<UserMessageShowMoreProps> = ({
  ref,
  className,
  onClick,
  showMoreLabel = 'Show more',
  showLessLabel = 'Show less',
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('show-more', testIdProp);
  const context = useUserMessageBubbleContext();
  if (!context) return null;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) context.toggle();
  };

  return (
    <button
      {...props}
      ref={ref}
      aria-expanded={context.expanded}
      aria-controls={context.contentId}
      type='button'
      data-slot='user-message-show-more'
      data-testid={testId}
      className={cn(userMessageShowMoreVariants(), className)}
      onClick={handleClick}
    >
      {context.expanded ? showLessLabel : showMoreLabel}
    </button>
  );
};

UserMessageShowMore.displayName = 'UserMessageShowMore';
