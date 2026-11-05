import { type FC, type ReactNode, useEffect, useRef } from 'react';
import { PortalContainerContext } from '../../../../design-system/src/lib/portal/PortalContainerContext';
import { reportUnstyledClasses } from './unstyledClasses';

export interface RootProps {
  theme?: 'light' | 'dark';
  children?: ReactNode;
}

/** Scopes a canvas artboard's theme and overlays without changing the page. */
export const Root: FC<RootProps> = ({ theme = 'light', children }) => {
  const root = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);

  // Warn about classes bundle.css does not define, after mount and after the markup changes.
  useEffect(() => {
    const element = root.current;
    if (!element || typeof MutationObserver === 'undefined') return;
    let timer = setTimeout(() => reportUnstyledClasses(element), 0);
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => reportUnstyledClasses(element), 250);
    });
    observer.observe(element, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <PortalContainerContext.Provider value={host}>
      <div
        ref={root}
        data-slot='root'
        data-theme={theme}
        className='bg-bg-page-bg text-text-primary font-sans'
      >
        {children}
        <div ref={host} />
      </div>
    </PortalContainerContext.Provider>
  );
};

Root.displayName = 'Root';
