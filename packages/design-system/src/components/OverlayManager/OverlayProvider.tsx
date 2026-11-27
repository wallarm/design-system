import {
  type FC,
  Suspense,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import { InstanceErrorBoundary } from './InstanceErrorBoundary';
import { OverlayInstanceContext, OverlayStoreContext } from './OverlayStoreContext';
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
      <OverlayInstanceContext.Provider value={controller}>
        <Suspense fallback={null}>
          <Component {...payload} controller={controller} />
        </Suspense>
      </OverlayInstanceContext.Provider>
    </InstanceErrorBoundary>
  );
};

/**
 * Renders its children, then every overlay opened through `useOverlay` below it. Mount one in the
 * root route component of each app and remote, wrapping everything that route renders.
 */
export const OverlayProvider: FC<OverlayProviderProps> = ({ children, closeOnChange, onError }) => {
  const parent = useContext(OverlayStoreContext);
  const [store] = useState(createOverlayStore);
  const instances = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  useLayoutEffect(() => {
    store.setOnError(onError ?? parent?.reportError ?? reportOverlayError);
  }, [store, onError, parent]);

  // A layout effect, so that a new page's mount useEffect in the same commit opens its overlays
  // after this sweep: every layout effect runs before any passive effect. The store ignores a
  // key it already holds, so a re-run with the same key (StrictMode, a Suspense reveal) is a no-op.
  useLayoutEffect(() => {
    store.setCloseKey(closeOnChange);
  }, [store, closeOnChange]);

  // Only a real unmount (or an <Activity> hide) may settle and drop the overlays. Release in a
  // passive cleanup, because a Suspense boundary above that re-suspends disconnects only layout
  // effects. StrictMode replays that cleanup on mount and on a Suspense reveal, but re-runs this
  // layout effect in the same tick, and the attach cancels the release before its deferred detach.
  useLayoutEffect(() => {
    store.attach();
  }, [store]);
  useEffect(() => store.release, [store]);

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
