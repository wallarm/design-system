import type { FC, HTMLAttributes, Ref } from 'react';
import { Avatar as ArkAvatar } from '@ark-ui/react/avatar';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { avatarVariants } from './classes';

export type AvatarStatusChangeDetails = ArkAvatar.StatusChangeDetails;

export interface AvatarProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof avatarVariants>,
    TestableProps {
  ref?: Ref<HTMLElement>;
  /** Render the single child element as the root — e.g. a `<button>` inside `FileUploadTrigger asChild`. */
  asChild?: boolean;
  onStatusChange?: (details: AvatarStatusChangeDetails) => void;
}

/**
 * A user's photo on a rounded plate, falling back to initials or an icon while the photo loads,
 * when it fails, or when there is none.
 */
export const Avatar: FC<AvatarProps> = ({
  ref,
  size,
  asChild = false,
  onStatusChange,
  className,
  children,
  'data-testid': testId,
  ...props
}) => {
  // A labelled standalone avatar is an image; an asChild root keeps its own role (e.g. button).
  const role = props.role ?? (props['aria-label'] && !asChild ? 'img' : undefined);

  return (
    <TestIdProvider value={testId}>
      <ArkAvatar.Root
        // Before the spread, so a data-slot passed in (FileUploadTrigger, NavRail) wins.
        data-slot='avatar'
        {...props}
        ref={ref as Ref<HTMLDivElement>}
        role={role}
        data-testid={testId}
        onStatusChange={onStatusChange}
        className={cn(avatarVariants({ size }), className)}
        asChild
      >
        {/* Ark's default root is a div, which is invalid inside a button. */}
        {asChild ? children : <span>{children}</span>}
      </ArkAvatar.Root>
    </TestIdProvider>
  );
};

Avatar.displayName = 'Avatar';
