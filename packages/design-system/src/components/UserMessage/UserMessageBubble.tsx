import {
  type FC,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import {
  userMessageBubbleVariants,
  userMessageFadeVariants,
  userMessageTextVariants,
} from './classes';
import { UserMessageBubbleContext } from './UserMessageContext';
import { UserMessageShowMore } from './UserMessageShowMore';

export interface UserMessageBubbleProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /**
   * The Show more / Show less toggle, rendered when the text overflows 11 lines.
   * Defaults to `<UserMessageShowMore />`; pass your own instance to add `data-*`
   * (the analytics seam) or custom labels; `null` or `false` renders no toggle.
   */
  showMore?: ReactNode;
}

/**
 * The message bubble. Text keeps its whitespace and is clamped to 11 lines; when it
 * overflows, a fade strip with the toggle appears at the bottom.
 */
export const UserMessageBubble: FC<UserMessageBubbleProps> = ({
  ref,
  className,
  children,
  showMore: showMoreProp,
  'data-testid': testIdProp,
  ...props
}) => {
  const showMore = showMoreProp === undefined ? <UserMessageShowMore /> : showMoreProp;
  const testId = useTestId('bubble', testIdProp);
  const textTestId = useTestId('text');
  const contentId = useId();
  const textRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  // Measured only while clamped: once expanded, the text can't overflow, so the last
  // result is kept and the toggle stays to collapse it again.
  // Layout effect so the first paint already has the toggle padding and fade.
  // re-measure when the text changes
  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || expanded) return;
    const measure = () => setOverflowing(el.scrollHeight > el.clientHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [expanded, children]);

  const toggle = () => setExpanded(value => !value);

  return (
    <div
      {...props}
      ref={ref}
      data-slot='user-message-bubble'
      data-testid={testId}
      className={cn(
        userMessageBubbleVariants({
          withToggle: overflowing && showMore != null && showMore !== false,
        }),
        className,
      )}
    >
      <UserMessageBubbleContext.Provider value={{ contentId, expanded, toggle }}>
        <div
          ref={textRef}
          id={contentId}
          data-slot='user-message-text'
          data-testid={textTestId}
          className={userMessageTextVariants({ clamped: !expanded })}
        >
          {children}
        </div>
        {overflowing && (
          <div data-slot='user-message-fade' className={userMessageFadeVariants({ expanded })}>
            {showMore}
          </div>
        )}
      </UserMessageBubbleContext.Provider>
    </div>
  );
};

UserMessageBubble.displayName = 'UserMessageBubble';
