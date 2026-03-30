import { forwardRef, type ReactNode } from 'react';
import { useTestId } from '../../utils/testId';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';
import { Text } from '../Text';

export interface ToastTitleProps {
  children: ReactNode;
  variant?: 'extended' | 'simple';
}

/**
 * Title component for Toast.
 *
 * Displays the main title text with medium weight.
 * For simple variant, limits to 1 line with tooltip on overflow.
 */
export const ToastTitle = forwardRef<HTMLDivElement, ToastTitleProps>(
  ({ children, variant = 'extended' }, ref) => {
    const isSimple = variant === 'simple';
    const testId = useTestId('title');

    return (
      <OverflowTooltip>
        <OverflowTooltipTrigger>
          <Text
            ref={ref}
            size='sm'
            weight='medium'
            color='primary-alt'
            lineClamp={isSimple ? 1 : 2}
            data-testid={testId}
          >
            {children}
          </Text>
        </OverflowTooltipTrigger>
        <OverflowTooltipContent>{children}</OverflowTooltipContent>
      </OverflowTooltip>
    );
  },
);

ToastTitle.displayName = 'ToastTitle';
