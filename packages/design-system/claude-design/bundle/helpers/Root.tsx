import { type FC, type ReactNode, useRef } from 'react';
import { PortalContainerContext } from '../../../src/lib/portal/PortalContainerContext';

export interface RootProps {
  theme?: 'light' | 'dark';
  children?: ReactNode;
}

/** Scopes a canvas artboard's theme and overlays without changing the page. */
export const Root: FC<RootProps> = ({ theme = 'light', children }) => {
  const host = useRef<HTMLDivElement>(null);

  return (
    <PortalContainerContext.Provider value={host}>
      <div
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
