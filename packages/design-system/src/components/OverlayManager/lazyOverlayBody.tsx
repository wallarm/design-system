import {
  type ComponentType,
  type FC,
  lazy,
  type ReactNode,
  Suspense,
  useContext,
  useState,
} from 'react';
import { useTestId } from '../../utils/testId';
import { InstanceErrorBoundary } from './InstanceErrorBoundary';
import { OverlayInstanceContext, OverlayStoreContext } from './OverlayStoreContext';
import { reportOverlayError } from './overlayStore';

export type LazyOverlayBodyProps<Props> = Props & {
  /** Shown in place of the body while its code loads: a skeleton shaped like the body and footer. */
  fallback: ReactNode;
};

export type LazyOverlayBody<Props> = FC<LazyOverlayBodyProps<Props>> & {
  /** Loads the code ahead of time and never rejects; an open after it renders the body at once. */
  preload: () => Promise<void>;
};

type ErasedBody = ComponentType<Record<string, unknown>>;

interface LazyBodyViewProps {
  /** Returns the lazy a new mount pins; the factory replaces it after a failed load. */
  getBody: () => ErasedBody;
  fallback: ReactNode;
  props: Record<string, unknown>;
}

/**
 * At module scope on purpose: React Compiler moves a closure that captures nothing from its
 * component to module scope, so a closure in the component that `lazyOverlayBody` returns would
 * lose the factory's variables. Everything per call arrives here as a prop.
 */
const LazyBodyView: FC<LazyBodyViewProps> = ({ getBody, fallback, props }) => {
  // Pinned per mount, above its own Suspense: a failed lazy stays failed here and reaches the
  // boundary, even when the shell re-renders before React retries, instead of loading again. The
  // next open takes the replacement. State on purpose: React Compiler's memo of a plain
  // `getBody()` call behaves the same in tests, but a cache is not a guarantee.
  const [Body] = useState(getBody);
  const controller = useContext(OverlayInstanceContext);
  const store = useContext(OverlayStoreContext);
  const statusTestId = useTestId('loading');

  const handleError = (error: unknown) => {
    (store?.reportError ?? reportOverlayError)(error);
    // The shell plays its exit over the fallback, and open() resolves undefined.
    controller?.close();
  };

  const body = (
    <Suspense
      fallback={
        <>
          <span role='status' aria-busy='true' className='sr-only' data-testid={statusTestId}>
            Loading
          </span>
          {fallback}
        </>
      }
    >
      <Body {...props} />
    </Suspense>
  );

  // Outside a managed overlay, a failure goes up to the app's error boundary.
  if (!controller) return body;
  return (
    <InstanceErrorBoundary fallback={fallback} onError={handleError}>
      {body}
    </InstanceErrorBoundary>
  );
};

LazyBodyView.displayName = 'LazyOverlayBodyView';

/**
 * Splits a managed overlay below its header: the shell (root, content and header) renders at
 * once, and the heavy part below it loads behind `fallback`. Call it at module scope with a loader
 * that returns the component itself, as `defineOverlay` takes, and render the result inside
 * `DialogContent` or `DrawerContent`, after the header. A body that fails to load or render closes
 * the overlay and reports to the provider's `onError`; the next open loads it again.
 */
export const lazyOverlayBody = <Props extends object>(
  load: () => Promise<ComponentType<Props> & { readonly _result?: never }>,
  // Empty unless the body has its own `fallback` prop, which would never arrive.
  ..._fallbackCheck: 'fallback' extends keyof Props
    ? [error: 'the body has a `fallback` prop, which lazyOverlayBody takes for itself']
    : []
): LazyOverlayBody<Props> => {
  let loaded: ErasedBody | undefined;
  let loading: Promise<ErasedBody> | undefined;

  const loadOnce = (): Promise<ErasedBody> => {
    loading ??= new Promise<ComponentType<Props>>(resolve => resolve(load())).then(
      component => {
        loaded = component as unknown as ErasedBody;
        return loaded;
      },
      (error: unknown) => {
        // React.lazy keeps a rejection forever: the next mount takes a fresh one, which loads again.
        loading = undefined;
        current = createBody();
        throw error;
      },
    );
    return loading;
  };

  const createBody = (): ErasedBody =>
    lazy(() => {
      const component = loaded;
      if (!component) return loadOnce().then(body => ({ default: body }));
      // React.lazy calls `then` at once and reads the result right after (lazyInitializer in
      // React 18.3 and 19), so a thenable that calls back synchronously renders without suspending.
      const resolved = {
        then: (resolve: (module: { default: ErasedBody }) => void) =>
          resolve({ default: component }),
      };
      return resolved as unknown as Promise<{ default: ErasedBody }>;
    });

  let current = createBody();
  const getBody = () => current;

  // No closures in here: see LazyBodyView.
  const LazyPart = ({ fallback, ...props }: LazyOverlayBodyProps<Props>) => (
    <LazyBodyView getBody={getBody} fallback={fallback} props={props} />
  );
  const preload = () =>
    loadOnce().then(
      () => undefined,
      () => undefined,
    );
  return Object.assign(LazyPart, { preload, displayName: 'LazyOverlayBody' });
};
