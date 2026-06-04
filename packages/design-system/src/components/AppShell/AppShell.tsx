import { type FC, type HTMLAttributes, type ReactNode, type Ref, useMemo, useRef } from 'react';
import { composeRefs } from '@radix-ui/react-compose-refs';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { AppShellContext } from './AppShellContext';
import { ExpandOverlay } from './ExpandOverlay';
import { RevealOverlay } from './RevealOverlay';
import { useShellAnimation } from './useShellAnimation';

export interface AppShellExpandFrom {
  width: number;
  height: number;
  borderRadius?: number;
}

export interface AppShellProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
  reveal?: boolean;
  expandFrom?: AppShellExpandFrom;
  onRevealed?: () => void;
  appeared?: boolean;
}

export const AppShell: FC<AppShellProps> = ({
  ref,
  className,
  children,
  reveal,
  expandFrom,
  onRevealed,
  appeared: appearedProp,
  'data-testid': testId,
  ...props
}) => {
  const internalRef = useRef<HTMLDivElement>(null);

  const {
    phase,
    targetRect,
    expandStyle,
    appeared,
    handleRevealOverlayTransitionEnd,
    handleExpandTransitionEnd,
  } = useShellAnimation(internalRef, { reveal, expandFrom, onRevealed, appearedProp });

  const shellContext = useMemo(() => ({ appeared }), [appeared]);

  return (
    <TestIdProvider value={testId}>
      <AppShellContext.Provider value={shellContext}>
        <div
          {...props}
          ref={composeRefs(internalRef, ref)}
          data-slot='app-shell'
          data-testid={testId}
          className={cn(
            'relative grid h-screen overscroll-none [grid-template-areas:"header_header""rail_remote"] [grid-template-columns:auto_1fr] [grid-template-rows:auto_1fr] bg-component-app-shell-bg',
            className,
          )}
          style={expandStyle}
          onTransitionEnd={expandFrom ? handleExpandTransitionEnd : undefined}
        >
          {children}

          {expandFrom && (
            <ExpandOverlay phase={phase} expandFrom={expandFrom} targetRect={targetRect} />
          )}

          {!expandFrom && (
            <RevealOverlay
              phase={phase}
              targetRect={targetRect}
              onTransitionEnd={handleRevealOverlayTransitionEnd}
            />
          )}
        </div>
      </AppShellContext.Provider>
    </TestIdProvider>
  );
};

AppShell.displayName = 'AppShell';
