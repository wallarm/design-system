import {
  type FC,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { composeRefs } from '@radix-ui/react-compose-refs';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { AppShellContext } from './AppShellContext';

type RevealPhase = 'initial' | 'revealing' | 'done';

export interface AppShellProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
  reveal?: boolean;
  onRevealed?: () => void;
  appeared?: boolean;
}

export const AppShell: FC<AppShellProps> = ({
  ref,
  className,
  children,
  reveal,
  onRevealed,
  appeared: appearedProp,
  'data-testid': testId,
  ...props
}) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const onRevealedRef = useRef(onRevealed);
  onRevealedRef.current = onRevealed;

  const [phase, setPhase] = useState<RevealPhase>(reveal ? 'initial' : 'done');
  const [targetRect, setTargetRect] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (phase !== 'initial') return;

    const shell = internalRef.current;
    if (!shell) return;

    let cancelled = false;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;

        const remote = shell.querySelector<HTMLElement>('[data-slot="app-shell-remote"]');
        if (!remote) {
          setPhase('done');
          onRevealedRef.current?.();
          return;
        }

        const shellRect = shell.getBoundingClientRect();
        const remoteRect = remote.getBoundingClientRect();

        setTargetRect({
          top: remoteRect.top - shellRect.top,
          left: remoteRect.left - shellRect.left,
        });
        setPhase('revealing');
      });
    });

    return () => {
      cancelled = true;
    };
  }, [phase]);

  const handleTransitionEnd = useCallback((e: React.TransitionEvent) => {
    if (e.propertyName === 'top') {
      setPhase('done');
      onRevealedRef.current?.();
    }
  }, []);

  const appeared = appearedProp ?? phase === 'done';
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
        >
          {children}
          {phase !== 'done' && (
            <div
              className={cn(
                'bg-bg-page-bg pointer-events-none z-50 absolute right-0 bottom-0',
                phase === 'revealing' && 'rounded-tl-12',
              )}
              style={{
                top: phase === 'revealing' && targetRect ? targetRect.top : 0,
                left: phase === 'revealing' && targetRect ? targetRect.left : 0,
                transition:
                  phase === 'revealing'
                    ? 'top 500ms ease-in-out, left 500ms ease-in-out, border-radius 500ms ease-in-out'
                    : undefined,
              }}
              onTransitionEnd={handleTransitionEnd}
            />
          )}
        </div>
      </AppShellContext.Provider>
    </TestIdProvider>
  );
};

AppShell.displayName = 'AppShell';
