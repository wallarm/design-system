import {
  type FC,
  type HTMLAttributes,
  isValidElement,
  type KeyboardEvent,
  type Ref,
  useRef,
} from 'react';
import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { isIconOnly } from '../../utils/isIconOnly';
import type { TestableProps } from '../../utils/testId';
import { numericBadgeVariants } from './classes';

type NumericBadgeNativeProps = Omit<HTMLAttributes<HTMLDivElement>, 'color'>;

type NumericBadgeVariantsProps = Omit<
  VariantProps<typeof numericBadgeVariants>,
  'clickable' | 'iconOnly'
>;

export type NumericBadgeProps = NumericBadgeNativeProps &
  NumericBadgeVariantsProps &
  TestableProps & {
    ref?: Ref<HTMLDivElement>;
    /** Applies the badge to its child element, such as a span or a native button. */
    asChild?: boolean;
    'data-slot'?: string;
  };

const hasNativeKeyboardActivation = (element: HTMLElement) =>
  element.tagName === 'BUTTON' ||
  element.tagName === 'INPUT' ||
  (element.tagName === 'A' && element.hasAttribute('href'));

export const NumericBadge: FC<NumericBadgeProps> = ({
  type = 'secondary',
  color = type === 'solid' ? 'brand' : 'neutral',
  size = 'default',
  asChild = false,
  children,
  className,
  ref,
  role,
  tabIndex,
  onClick,
  onKeyDown,
  onKeyUp,
  onBlur,
  'data-slot': dataSlot,
  ...props
}) => {
  const child =
    asChild &&
    isValidElement<HTMLAttributes<HTMLElement> & { href?: string; disabled?: boolean }>(children)
      ? children
      : null;
  const childProps = child?.props;
  const nativeChild =
    child?.type === 'button' ||
    child?.type === 'input' ||
    (child?.type === 'a' && childProps?.href != null);
  const isClickable = !childProps?.disabled && !!(onClick || childProps?.onClick || nativeChild);
  const spacePressed = useRef(false);
  const Comp = asChild ? Slot : 'div';

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (
      event.defaultPrevented ||
      !isClickable ||
      event.target !== event.currentTarget ||
      hasNativeKeyboardActivation(event.currentTarget)
    ) {
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.click();
    } else if (event.key === ' ') {
      event.preventDefault();
      spacePressed.current = true;
    }
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyUp?.(event);
    if (event.key !== ' ') return;
    const activate = spacePressed.current;
    spacePressed.current = false;
    if (
      activate &&
      !event.defaultPrevented &&
      isClickable &&
      event.target === event.currentTarget &&
      !hasNativeKeyboardActivation(event.currentTarget)
    ) {
      event.preventDefault();
      event.currentTarget.click();
    }
  };

  return (
    <Comp
      {...props}
      ref={ref}
      role={role ?? (isClickable && !nativeChild ? 'button' : undefined)}
      tabIndex={tabIndex ?? (isClickable && !nativeChild ? 0 : undefined)}
      data-slot={dataSlot ?? 'numeric-badge'}
      data-type={type}
      data-color={color}
      onClick={
        onClick
          ? event => {
              if (!event.defaultPrevented) onClick(event);
            }
          : undefined
      }
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={event => {
        spacePressed.current = false;
        onBlur?.(event);
      }}
      className={cn(
        numericBadgeVariants({
          type,
          color,
          size,
          clickable: isClickable,
          iconOnly: isIconOnly(child ? child.props.children : children),
        }),
        className,
      )}
    >
      {children}
    </Comp>
  );
};

NumericBadge.displayName = 'NumericBadge';
