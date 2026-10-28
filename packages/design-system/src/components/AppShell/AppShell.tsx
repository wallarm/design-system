import {
  type CSSProperties,
  type FC,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useMemo,
  useRef,
} from 'react';

import { composeRefs } from '@radix-ui/react-compose-refs';

import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { AppShellAmbient } from './AppShellAmbient';
import { AppShellContext } from './AppShellContext';
import { ASIDE_SLIDE_EASE, ASIDE_SLIDE_MS } from './constants';
import { ExpandOverlay } from './ExpandOverlay';
import { RevealOverlay } from './RevealOverlay';
import { useShellAnimation } from './useShellAnimation';

// Inline on purpose, like expandStyle: constants.ts stays the single source of the slide's
// timing, which Tailwind classes cannot read. Do not inline the values as class literals.
const ASIDE_MOTION = {
  '--app-shell-aside-duration': `${ASIDE_SLIDE_MS}ms`,
  '--app-shell-aside-ease': ASIDE_SLIDE_EASE,
} as CSSProperties;

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
  /**
   * The Frame's ambient layer — soft blooms, grain and a dot cluster behind the header and
   * rail. On by default; `false` leaves the flat Frame token fill.
   */
  ambient?: boolean;
}

export const AppShell: FC<AppShellProps> = ({
  ref,
  className,
  children,
  reveal,
  expandFrom,
  onRevealed,
  appeared: appearedProp,
  ambient = true,
  style,
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
            'relative isolate grid h-screen [grid-template-columns:auto_1fr] [grid-template-rows:auto_1fr] overscroll-none bg-component-app-shell-bg [grid-template-areas:"header_header""rail_remote"]',
            // The panel's width, read by AppShellAside too; override it on the shell's className.
            '[--app-shell-aside-width:--spacing(480)]',
            // Only a composed AppShellAside adds the third area, an empty 0px track and the edge
            // clip, so a shell without one keeps the grid above exactly.
            'has-[>[data-slot=app-shell-aside]]:[grid-template-columns:auto_1fr_0px] has-[>[data-slot=app-shell-aside]]:overflow-x-clip has-[>[data-slot=app-shell-aside]]:[grid-template-areas:"header_header_header""rail_remote_aside"]',
            // Open, the track widens to the panel's margin box (its width plus the spacing-8
            // margins either side) and slides between the two.
            'has-[>[data-slot=app-shell-aside][data-state=open]]:[grid-template-columns:auto_1fr_calc(var(--app-shell-aside-width)+var(--spacing-8)*2)]',
            'transition-[grid-template-columns] duration-(--app-shell-aside-duration) ease-(--app-shell-aside-ease) motion-reduce:transition-none',
            className,
          )}
          // The slide's timing variables (see ASIDE_MOTION), the consumer's style, then the boot
          // animation's own style.
          style={{ ...ASIDE_MOTION, ...style, ...expandStyle }}
          onTransitionEnd={expandFrom ? handleExpandTransitionEnd : undefined}
        >
          {ambient && <AppShellAmbient />}
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
