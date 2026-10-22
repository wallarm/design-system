import type { FC, ReactNode, Ref } from 'react';
import { useTestId } from '../../utils/testId';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';
import { Text } from '../Text';

export interface ToastDescriptionProps {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Description component for Toast.
 *
 * Displays secondary description text with regular weight and secondary color.
 * Supports text truncation with configurable max lines.
 * Shows a tooltip with full text when content is truncated.
 */
export const ToastDescription: FC<ToastDescriptionProps> = ({ ref, children }) => {
  const testId = useTestId('description');

  return (
    <OverflowTooltip>
      <OverflowTooltipTrigger>
        <Text ref={ref} size='sm' color='secondary-alt' lineClamp={4} data-testid={testId}>
          {children}
        </Text>
      </OverflowTooltipTrigger>
      <OverflowTooltipContent>{children}</OverflowTooltipContent>
    </OverflowTooltip>
  );
};

ToastDescription.displayName = 'ToastDescription';
