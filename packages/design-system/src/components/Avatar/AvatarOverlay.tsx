import type { FC, HTMLAttributes, Ref } from 'react';
import { RefreshCcw } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { avatarOverlayClassNames } from './classes';

export interface AvatarOverlayProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
  /** Keep it shown regardless of hover — e.g. a `Loader` while the new photo uploads. */
  visible?: boolean;
}

/**
 * The "change photo" affordance, shown on hover and keyboard focus of an interactive
 * (`as='button'`) avatar. Over a photo it adds a wash; over the fallback it swaps the icon.
 */
export const AvatarOverlay: FC<AvatarOverlayProps> = ({
  ref,
  visible = false,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('overlay');

  return (
    <span
      {...props}
      ref={ref}
      aria-hidden
      data-slot='avatar-overlay'
      data-visible={visible ? '' : undefined}
      data-testid={testId}
      className={cn(avatarOverlayClassNames, className)}
    >
      {children ?? <RefreshCcw size='md' />}
    </span>
  );
};

AvatarOverlay.displayName = 'AvatarOverlay';
