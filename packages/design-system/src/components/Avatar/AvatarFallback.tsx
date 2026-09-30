import type { ComponentType, FC, HTMLAttributes, Ref } from 'react';
import { Avatar as ArkAvatar } from '@ark-ui/react/avatar';
import { type SvgIconProps, UserRound } from '../../icons';
import { cn } from '../../utils/cn';
import { getInitials } from '../../utils/getInitials';
import { useTestId } from '../../utils/testId';
import { avatarFallbackClassNames } from './classes';

export interface AvatarFallbackProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
  /** Initials are taken from this: first letter of the first and of the last word. */
  name?: string;
  /** Shown when there are no children and `name` gives no initials. */
  icon?: ComponentType<SvgIconProps>;
}

/** Shown while the photo loads, when it fails, and when there is none. */
export const AvatarFallback: FC<AvatarFallbackProps> = ({
  ref,
  name,
  icon: Icon = UserRound,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('fallback');
  const initials = name ? getInitials(name) : '';
  const showsInitials = children == null && initials !== '';

  return (
    <ArkAvatar.Fallback
      // The image's alt or the root's label names the person; initials read aloud are noise.
      // Before the spread, so a consumer can expose meaningful fallback text (aria-hidden={false}).
      aria-hidden
      {...props}
      ref={ref}
      data-slot='avatar-fallback'
      data-testid={testId}
      // Initials are text (spec §6), not an icon — they stay text-primary even in the Branded frame.
      className={cn(avatarFallbackClassNames, showsInitials && 'text-text-primary', className)}
    >
      {children ?? (initials || <Icon size='md' />)}
    </ArkAvatar.Fallback>
  );
};

AvatarFallback.displayName = 'AvatarFallback';
