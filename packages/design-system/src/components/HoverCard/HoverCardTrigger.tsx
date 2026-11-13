import type { ComponentPropsWithoutRef, FC, ReactElement, Ref } from 'react';
import { HoverCard as ArkUiHoverCard } from '@ark-ui/react/hover-card';
import { type TestableProps, useTestId } from '../../utils/testId';

/**
 * Always asChild. The child is the item's real interactive element: a DS Link, a router link,
 * <a href> or <button>. Analytics attributes, aria-*, id, ref and handlers go on the child.
 * Ark composes its focus, blur and pointer handlers with the child's own; it never replaces them.
 * data-testid: useTestId('trigger', override). Pass it explicitly when the trigger sits inside
 * Avatar or AgentItem, because they re-provide the cascade.
 * On an element that already has a Tooltip, nest the two asChild triggers in either order
 * (<HoverCardTrigger><TooltipTrigger asChild>…</TooltipTrigger></HoverCardTrigger> or the reverse)
 * and pass the same id to both roots' `ids.trigger` (the `<Tooltip>` root inside `<HoverCard>`): the outer trigger's id wins, so with
 * different ids one machine loses its anchor. Props and the ref an outer asChild passes in are
 * forwarded to Ark, which composes them with its own.
 */
export interface HoverCardTriggerProps
  extends Omit<ComponentPropsWithoutRef<typeof ArkUiHoverCard.Trigger>, 'asChild' | 'children'>,
    TestableProps {
  ref?: Ref<HTMLButtonElement>;
  children: ReactElement;
}

export const HoverCardTrigger: FC<HoverCardTriggerProps> = ({
  ref,
  children,
  'data-testid': testIdProp,
  ...rest
}) => {
  const testId = useTestId('trigger', testIdProp);

  return (
    <ArkUiHoverCard.Trigger {...rest} ref={ref} asChild data-testid={testId}>
      {children}
    </ArkUiHoverCard.Trigger>
  );
};

HoverCardTrigger.displayName = 'HoverCardTrigger';
