import { forwardRef, type ReactNode } from 'react';

import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';
import { Text } from '../Text';

export interface ToastDescriptionProps {
  children: ReactNode;
}

/**
 * Description component for Toast.
 *
 * Displays secondary description text with regular weight and secondary color.
 * Supports text truncation with configurable max lines.
 * Shows a tooltip with full text when content is truncated.
 */
export const ToastDescription = forwardRef<
  HTMLDivElement,
  ToastDescriptionProps
>(({ children }, ref) => (
  <OverflowTooltip>
    <OverflowTooltipTrigger>
      <Text ref={ref} size="md" color="secondary-alt" lineClamp={4}>
        {children}
      </Text>
    </OverflowTooltipTrigger>
    <OverflowTooltipContent>{children}</OverflowTooltipContent>
  </OverflowTooltip>
));

ToastDescription.displayName = 'ToastDescription';
