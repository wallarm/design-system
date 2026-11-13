import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';

export interface HoverCardDescriptionProps extends HTMLAttributes<HTMLSpanElement>, TestableProps {
  ref?: Ref<HTMLSpanElement>;
  children: ReactNode;
}

/** Role or email, on one line, truncated with an ellipsis; the full text shows in a tooltip when it overflows. */
export const HoverCardDescription: FC<HoverCardDescriptionProps> = ({
  ref,
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('description', testIdProp);

  // Scope the tooltip under this part (X--description--content), so it never reuses the card's X--content.
  return (
    <TestIdProvider value={testId}>
      <OverflowTooltip>
        <OverflowTooltipTrigger ref={ref as Ref<HTMLElement>}>
          <span
            {...props}
            data-slot='hover-card-description'
            data-testid={testId}
            className={cn('min-w-0 truncate text-sm text-text-secondary', className)}
          >
            {children}
          </span>
        </OverflowTooltipTrigger>
        <OverflowTooltipContent>{children}</OverflowTooltipContent>
      </OverflowTooltip>
    </TestIdProvider>
  );
};

HoverCardDescription.displayName = 'HoverCardDescription';
