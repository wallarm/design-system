import { type FC, Suspense, useLayoutEffect, useState, useSyncExternalStore } from 'react';
import { InstanceErrorBoundary } from './InstanceErrorBoundary';
import { OverlayStoreContext } from './OverlayStoreContext';
import {
  createOverlayStore,
  type OverlayInstance,
  type OverlayStore,
  reportOverlayError,
} from './overlayStore';
import type { OverlayController, OverlayProviderProps } from './types';

interface OverlayInstanceViewProps {
  store: OverlayStore;
  instance: OverlayInstance;
}

/**
 * One open overlay. The boundaries wrap the whole overlay component, above its root: an overlay
 * that suspends or throws affects only itself, and its root, content and title commit together.
 */
const OverlayInstanceView: FC<OverlayInstanceViewProps> = ({ store, instance }) => {
  const { id, Component, payload, open } = instance;

  const handleOpenChange = (next: boolean) => {
    if (!next) store.close(id);
  };
  const handleExitComplete = () => store.remove(id);
  const handleClose = (result?: unknown) => store.close(id, result);
  const handleError = (error: unknown) => store.fail(id, error);

  const controller: OverlayController<unknown> = {
    rootProps: { open, onOpenChange: handleOpenChange, onExitComplete: handleExitComplete },
    close: handleClose,
  };

  return (
    <InstanceErrorBoundary onError={handleError}>
      <Suspense fallback={null}>
        <Component {...payload} controller={controller} />
      </Suspense>
    </InstanceErrorBoundary>
  );
};

/**
 * Renders its children, then every overlay opened through `useOverlay` below it. Mount one in the
 * root route component of each app and remote, wrapping everything that route renders.
 */
export const OverlayProvider: FC<OverlayProviderProps> = ({ children, onError }) => {
  const [store] = useState(createOverlayStore);
  const instances = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  useLayoutEffect(() => {
    store.setOnError(onError ?? reportOverlayError);
  }, [store, onError]);

  // A layout effect: StrictMode's replay re-attaches before any passive effect, so a child's
  // mount-effect open() does not hit the detached store.
  useLayoutEffect(() => {
    store.attach();
    return store.detach;
  }, [store]);

  return (
    <OverlayStoreContext.Provider value={store}>
      {children}
      {instances.map(instance => (
        <OverlayInstanceView key={instance.id} store={store} instance={instance} />
      ))}
    </OverlayStoreContext.Provider>
  );
};

OverlayProvider.displayName = 'OverlayProvider';
