import type { ComponentType, FC, HTMLAttributes, Ref } from 'react';
import { Avatar as ArkAvatar } from '@ark-ui/react/avatar';
import { type SvgIconProps, UserRound } from '../../icons';
import { cn } from '../../utils/cn';
import { getInitials } from '../../utils/getInitials';
import { useTestId } from '../../utils/testId';
import { useAvatarSize } from './AvatarContext';
import { avatarFallbackVariants, avatarPlateVariants } from './classes';

export interface AvatarFallbackProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
  /** Initials are taken from this: first letter of the first and of the last word (first word only at `sm`). */
  name?: string;
  /** Shown when there are no children and `name` gives no initials. */
  icon?: ComponentType<SvgIconProps>;
}

/** The plate: shown while the photo loads, when it fails, and when there is none. */
export const AvatarFallback: FC<AvatarFallbackProps> = ({
  ref,
  name,
  icon: Icon = UserRound,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('fallback');
  const size = useAvatarSize();
  // A 20px plate fits one letter only (Figma 12336:5504): the first word's initial.
  const initials = !name
    ? ''
    : size === 'sm'
      ? (name.trim().split(/\s+/).map(getInitials).find(Boolean) ?? '')
      : getInitials(name);
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
      // The fallback is the plate (tint + stroke). Initials are text (text-primary), the icon is an
      // icon (icon-primary); in the Branded frame both take the brand colour (Figma 12336:5504).
      className={cn(
        avatarPlateVariants({ size }),
        avatarFallbackVariants({ initials: showsInitials }),
        className,
      )}
    >
      {children ?? (initials || <Icon size='md' />)}
    </ArkAvatar.Fallback>
  );
};

AvatarFallback.displayName = 'AvatarFallback';
