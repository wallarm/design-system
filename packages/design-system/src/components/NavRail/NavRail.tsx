import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { useCallback, useRef } from 'react';
import { composeRefs } from '@radix-ui/react-compose-refs';
import { useArrowNav } from '../../hooks/useArrowNav';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { navRailVariants } from './classes';
import { NavRailContextProvider, type NavRailMode } from './NavRailContext';

export interface NavRailProps extends HTMLAttributes<HTMLElement>, TestableProps {
  ref?: Ref<HTMLElement>;
  children?: ReactNode;
  /**
   * How the rail lays out its items: `expanded` (icon beside label), `collapsed` (icon only) or
   * `compact` (icon over a short label). Wins over `collapsed` when both are set.
   */
  mode?: NavRailMode;
  /** Shorthand for `mode='collapsed'`, kept so existing hosts keep working. Prefer `mode`. */
  collapsed?: boolean;
}

export const NavRail: FC<NavRailProps> = ({
  ref,
  mode: modeProp,
  collapsed = false,
  className,
  children,
  'data-testid': testId,
  ...props
}) => {
  const internalRef = useRef<HTMLElement>(null);
  const mode: NavRailMode = modeProp ?? (collapsed ? 'collapsed' : 'expanded');

  const focusPanel = useCallback(() => {
    const panel = document.querySelector<HTMLElement>('[data-slot="nav-panel"]');
    const target = panel?.querySelector<HTMLElement>('[tabindex="0"]');
    target?.focus();
  }, []);

  const focusPanelAfterNav = useCallback(() => {
    const observer = new MutationObserver(() => {
      const panel = document.querySelector<HTMLElement>('[data-slot="nav-panel"]');
      const target = panel?.querySelector<HTMLElement>(
        '[data-slot="nav-panel-item"], [data-slot="nav-panel-back"]',
      );
      if (target) {
        target.setAttribute('tabindex', '0');
        target.focus();
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 2000);
  }, []);

  useArrowNav(internalRef, '[data-slot="nav-rail-item"]', {
    onArrowRight: focusPanel,
    onEnter: focusPanelAfterNav,
  });

  return (
    <TestIdProvider value={testId}>
      <NavRailContextProvider value={{ mode }}>
        <nav
          {...props}
          ref={composeRefs(internalRef, ref)}
          aria-label='Global navigation'
          data-slot='nav-rail'
          data-mode={mode}
          data-testid={testId}
          className={cn(navRailVariants({ mode }), className)}
        >
          {children}
        </nav>
      </NavRailContextProvider>
    </TestIdProvider>
  );
};

NavRail.displayName = 'NavRail';
