import type { ComponentPropsWithoutRef, ElementRef, FC, Ref } from 'react';
import { Portal as ArkUiPortal } from '@ark-ui/react/portal';
import { Tooltip as ArkUiTooltip } from '@ark-ui/react/tooltip';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { hasNonTextEnd } from '../../utils/hasNonTextEnd';

const tooltipContentVariants = cva(
  [
    // Base
    'py-4 rounded-8 bg-component-tooltip-bg text-text-primary-alt-fixed text-xs font-medium',
    // Behavior
    'z-50 overflow-hidden',
    // Animation base
    'animate-in fade-in-0 zoom-in-95 origin-[--transform-origin]',
    // Animation closed
    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
    // Animation bottom
    'data-[side=bottom]:slide-in-from-top-2',
    // Animation left
    'data-[side=left]:slide-in-from-right-2',
    // Animation right
    'data-[side=right]:slide-in-from-left-2',
    // Animation top
    'data-[side=top]:slide-in-from-bottom-2',
    // Kbd behavior
    '[&>[data-slot=kbd]]:bg-component-kbi-tooltip-bg [&>[data-slot=kbd]]:border-0 [&>[data-slot=kbd]]:text-text-primary-alt-fixed',
  ],
  {
    variants: {
      hasNonTextEnd: {
        true: 'pl-8 pr-4',
        false: 'px-8',
      },
    },
  },
);

type TooltipContentProps = ComponentPropsWithoutRef<typeof ArkUiTooltip.Content> & {
  ref?: Ref<ElementRef<typeof ArkUiTooltip.Content>>;
};

export const TooltipContent: FC<TooltipContentProps> = ({ children, className, ref, ...props }) => (
  <ArkUiPortal>
    <ArkUiTooltip.Positioner>
      <ArkUiTooltip.Content
        ref={ref}
        className={cn(
          tooltipContentVariants({ hasNonTextEnd: hasNonTextEnd(children) }),
          className,
        )}
        {...props}
      >
        {children}
      </ArkUiTooltip.Content>
    </ArkUiTooltip.Positioner>
  </ArkUiPortal>
);

TooltipContent.displayName = 'TooltipContent';
