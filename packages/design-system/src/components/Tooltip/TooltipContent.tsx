import type { ComponentPropsWithoutRef, ElementRef, FC, Ref } from 'react';

import { Content, Portal } from '@radix-ui/react-tooltip';
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
    'animate-in fade-in-0 zoom-in-95 origin-[--radix-tooltip-content-transform-origin]',
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

type TooltipContentProps = ComponentPropsWithoutRef<typeof Content> & {
  ref?: Ref<ElementRef<typeof Content>>;
};

export const TooltipContent: FC<TooltipContentProps> = ({
  children,
  sideOffset = 6,
  className,
  ref,
  ...props
}) => (
  <Portal>
    <Content
      ref={ref}
      sideOffset={sideOffset}
      collisionPadding={8}
      className={cn(
        tooltipContentVariants({ hasNonTextEnd: hasNonTextEnd(children) }),
        className,
      )}
      {...props}
    >
      {children}
    </Content>
  </Portal>
);

TooltipContent.displayName = 'TooltipContent';
