import {
  type FC,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { composeRefs } from '@radix-ui/react-compose-refs';
import { useArrowNav } from '../../hooks/useArrowNav';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { NavPanelInternalProvider } from './NavPanelContext';
import { NavPanelResizeHandle } from './NavPanelResizeHandle';

const DEFAULT_WIDTH = 216;
const MIN_WIDTH = 164;
const MAX_WIDTH = 256;

export interface NavPanelProps extends HTMLAttributes<HTMLElement>, TestableProps {
  ref?: Ref<HTMLElement>;
  children?: ReactNode;
  resizable?: boolean;
}

export const NavPanel: FC<NavPanelProps> = ({
  ref,
  className,
  children,
  resizable = false,
  'data-testid': testId,
  'aria-label': ariaLabel = 'Product navigation',
  ...props
}) => {
  const internalRef = useRef<HTMLElement>(null);

  const focusRail = useCallback(() => {
    const rail = document.querySelector<HTMLElement>('[data-slot="nav-rail"]');
    const target = rail?.querySelector<HTMLElement>('[tabindex="0"]');
    target?.focus();
  }, []);

  const focusFirstItemAfterNav = useCallback(() => {
    const container = internalRef.current;
    if (!container) return;
    const observer = new MutationObserver(() => {
      const back = container.querySelector<HTMLElement>('[data-slot="nav-panel-back"]');
      const first = container.querySelector<HTMLElement>(
        '[data-slot="nav-panel-item"], [data-slot="nav-panel-back"]',
      );
      const target = back ?? first;
      if (target) {
        target.setAttribute('tabindex', '0');
        target.focus();
        observer.disconnect();
      }
    });
    observer.observe(container, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 2000);
  }, []);

  useArrowNav(
    internalRef,
    '[data-slot="nav-panel-item"], [data-slot="nav-panel-group-label"], [data-slot="nav-panel-group-item"], [data-slot="nav-panel-back"]',
    { onArrowLeft: focusRail, onEnter: focusFirstItemAfterNav },
  );

  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  const contextValue = useMemo(
    () => ({
      width,
      setWidth,
      isResizing,
      setIsResizing,
      minWidth: MIN_WIDTH,
      maxWidth: MAX_WIDTH,
    }),
    [width, isResizing],
  );

  if (resizable) {
    return (
      <TestIdProvider value={testId}>
        <NavPanelInternalProvider value={contextValue}>
          <aside
            {...props}
            ref={composeRefs(internalRef, ref)}
            aria-label={ariaLabel}
            data-slot='nav-panel'
            data-testid={testId}
            style={{ width }}
            className={cn(
              'relative h-full shrink-0 border-r border-border-primary pt-8',
              isResizing && 'select-none',
              className,
            )}
          >
            <div className='flex h-full flex-col gap-2 overflow-y-auto [scrollbar-width:thin] px-8 pb-8'>
              {children}
            </div>
            <NavPanelResizeHandle />
          </aside>
        </NavPanelInternalProvider>
      </TestIdProvider>
    );
  }

  return (
    <TestIdProvider value={testId}>
      <aside
        {...props}
        ref={composeRefs(internalRef, ref)}
        aria-label={ariaLabel}
        data-slot='nav-panel'
        data-testid={testId}
        className={cn(
          'flex h-full w-[216px] shrink-0 flex-col gap-2 overflow-y-auto [scrollbar-width:thin] border-r border-border-primary p-8',
          className,
        )}
      >
        {children}
      </aside>
    </TestIdProvider>
  );
};

NavPanel.displayName = 'NavPanel';
