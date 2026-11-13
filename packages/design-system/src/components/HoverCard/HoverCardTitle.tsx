import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';

const hoverCardTitleVariants = cva('min-w-0 truncate text-xl leading-xl text-text-primary', {
  variants: {
    variant: {
      person: 'font-sans-display font-normal tracking-xl',
      // Geist Pixel has one weight; never font-bold.
      agent: 'font-pixel',
    },
  },
  defaultVariants: { variant: 'person' },
});

export interface HoverCardTitleProps extends HTMLAttributes<HTMLSpanElement>, TestableProps {
  ref?: Ref<HTMLSpanElement>;
  /** `agent` sets the name in Geist Pixel. Default `person`. */
  variant?: 'person' | 'agent';
  children: ReactNode;
}

/** The name, on one line, truncated with an ellipsis; the full text shows in a tooltip when it overflows. */
export const HoverCardTitle: FC<HoverCardTitleProps> = ({
  ref,
  variant = 'person',
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('title', testIdProp);

  // Scope the tooltip under this part (X--title--content), so it never reuses the card's X--content.
  return (
    <TestIdProvider value={testId}>
      <OverflowTooltip>
        <OverflowTooltipTrigger ref={ref as Ref<HTMLElement>}>
          <span
            {...props}
            data-slot='hover-card-title'
            data-testid={testId}
            className={cn(hoverCardTitleVariants({ variant }), className)}
          >
            {children}
          </span>
        </OverflowTooltipTrigger>
        <OverflowTooltipContent>{children}</OverflowTooltipContent>
      </OverflowTooltip>
    </TestIdProvider>
  );
};

HoverCardTitle.displayName = 'HoverCardTitle';
