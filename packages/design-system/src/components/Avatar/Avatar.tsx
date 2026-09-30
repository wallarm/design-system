import type { ButtonHTMLAttributes, FC, HTMLAttributes, Ref } from 'react';
import { Avatar as ArkAvatar } from '@ark-ui/react/avatar';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { avatarVariants } from './classes';

export type AvatarStatusChangeDetails = ArkAvatar.StatusChangeDetails;

export interface AvatarProps
  extends HTMLAttributes<HTMLElement>,
    Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'type' | 'name' | 'value' | 'form'>,
    VariantProps<typeof avatarVariants>,
    TestableProps {
  ref?: Ref<HTMLElement>;
  /** Root tag. 'button' makes the avatar itself interactive (e.g. inside FileUploadTrigger asChild). */
  as?: 'span' | 'button';
  /** Render the single child element as the root instead of `as`; takes precedence over it. */
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
  as: Tag = 'span',
  asChild = false,
  type,
  onStatusChange,
  className,
  children,
  'data-testid': testId,
  ...props
}) => {
  // A labelled standalone avatar is an image; asChild and button roots keep their own role.
  const role =
    props.role ?? (props['aria-label'] && !asChild && Tag !== 'button' ? 'img' : undefined);

  return (
    <TestIdProvider value={testId}>
      <ArkAvatar.Root
        // Before the spread, so a data-slot passed in (FileUploadTrigger, NavRail) wins.
        data-slot='avatar'
        {...props}
        ref={ref as Ref<HTMLDivElement>}
        role={role}
        // An asChild child receives a consumer `type`; our own button gets it below.
        {...(asChild && type ? { type } : {})}
        data-testid={testId}
        onStatusChange={onStatusChange}
        className={cn(avatarVariants({ size }), className)}
        asChild
      >
        {/* Ark's default root is a div, which is invalid inside a button; render a span or a real button instead. */}
        {asChild ? (
          children
        ) : (
          <Tag type={Tag === 'button' ? (type ?? 'button') : undefined}>{children}</Tag>
        )}
      </ArkAvatar.Root>
    </TestIdProvider>
  );
};

Avatar.displayName = 'Avatar';
