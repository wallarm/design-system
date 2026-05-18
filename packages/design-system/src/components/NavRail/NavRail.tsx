import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { useCallback, useRef } from 'react';
import { composeRefs } from '@radix-ui/react-compose-refs';
import { useArrowNav } from '../../hooks/useArrowNav';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { navRailVariants } from './classes';
import { NavRailContextProvider } from './NavRailContext';

export interface NavRailProps extends HTMLAttributes<HTMLElement>, TestableProps {
  ref?: Ref<HTMLElement>;
  children?: ReactNode;
  collapsed?: boolean;
}

export const NavRail: FC<NavRailProps> = ({
  ref,
  collapsed = false,
  className,
  children,
  'data-testid': testId,
  ...props
}) => {
  const internalRef = useRef<HTMLElement>(null);

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
      <NavRailContextProvider value={{ collapsed }}>
        <nav
          {...props}
          ref={composeRefs(internalRef, ref)}
          aria-label='Global navigation'
          data-slot='nav-rail'
          data-testid={testId}
          className={cn(navRailVariants({ collapsed }), className)}
        >
          {children}
        </nav>
      </NavRailContextProvider>
    </TestIdProvider>
  );
};

NavRail.displayName = 'NavRail';
