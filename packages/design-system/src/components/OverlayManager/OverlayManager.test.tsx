import {
  createContext,
  lazy,
  type ReactNode,
  StrictMode,
  Suspense,
  useContext,
  useEffect,
  useLayoutEffect,
} from 'react';
import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from '../Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../Dialog';
import { Drawer, DrawerBody, DrawerContent } from '../Drawer';
import { defineOverlay } from './defineOverlay';
import { OverlayProvider } from './OverlayProvider';
import { REMOVE_FALLBACK_MS } from './overlayStore';
import type { OverlayProps } from './types';
import { useOverlay } from './useOverlay';

// zag registers a dismissable layer through raf / nextTick / setTimeout(0); give every one a turn.
const flushLayers = async () => {
  for (let i = 0; i < 10; i++) {
    await act(() => new Promise(resolve => setTimeout(resolve, 20)));
  }
};

/**
 * jsdom has no CSS animations, so an exit ends one frame after it starts. Make the matching nodes
 * "animate" out instead: their exit then waits for an `animationend`. zag caches computed styles
 * per node, so call this before they mount.
 */
const animateExit = (selector: string) => {
  const realGetComputedStyle = window.getComputedStyle.bind(window);
  rs.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) => {
    if (!element.matches(selector)) return realGetComputedStyle(element, pseudo);
    return {
      get animationName() {
        return element.getAttribute('data-state') === 'closed' ? 'exit' : 'enter';
      },
      animationDuration: '0.15s',
      display: 'block',
    } as unknown as CSSStyleDeclaration;
  });
};

const Marker = createContext('none');

interface ConfirmProps extends OverlayProps<boolean> {
  name: string;
}
const ConfirmDialog = ({ name, controller }: ConfirmProps) => {
  const marker = useContext(Marker);
  const handleConfirm = () => controller.close(true);
  return (
    <Dialog {...controller.rootProps} data-testid='confirm'>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Delete {name}? ({marker})
          </DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button data-testid='confirm-cancel'>Cancel</Button>
          </DialogClose>
          <Button data-testid='confirm-ok' onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
const ConfirmOverlay = defineOverlay(async () => ConfirmDialog);

// Fixtures that close over a test-scope value live here: React Compiler moves a closure that
// captures nothing from its component to module scope, out of reach of the test's variables.
/** Called when a tracked overlay unmounts, which is when the provider drops its instance. */
const unmountSpy = rs.fn();
const TrackedConfirm = (props: ConfirmProps) => {
  useEffect(() => unmountSpy, []);
  return <ConfirmDialog {...props} />;
};
const TrackedOverlay = defineOverlay(async () => TrackedConfirm);

/** Passes only `open` and `onOpenChange` to its root, so the root never reports its exit. */
const NoExitConfirm = ({ controller }: ConfirmProps) => {
  useEffect(() => unmountSpy, []);
  const { open, onOpenChange } = controller.rootProps;
  const handleConfirm = () => controller.close(true);
  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-testid='confirm'>
      <DialogContent>
        <DialogFooter>
          <Button data-testid='confirm-ok' onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
const NoExitOverlay = defineOverlay(async () => NoExitConfirm);

const InfoDialog = ({ controller }: OverlayProps) => (
  <Dialog {...controller.rootProps} data-testid='info'>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Deleted</DialogTitle>
      </DialogHeader>
    </DialogContent>
  </Dialog>
);
const InfoOverlay = defineOverlay(async () => InfoDialog);

/** A managed Drawer with the confirm's payload and result, so `Opener` can open it. */
const PanelDrawer = ({ name, controller }: ConfirmProps) => {
  const handleDone = () => controller.close(true);
  return (
    <Drawer {...controller.rootProps} data-testid='panel'>
      <DrawerContent>
        <DrawerBody>
          {name}
          <Button data-testid='panel-done' onClick={handleDone}>
            Done
          </Button>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
const PanelOverlay = defineOverlay(async () => PanelDrawer);

/** A managed Drawer that closes itself once the confirm it opens is confirmed, like the stories' edit drawer. */
const DeletingDrawer = ({ name, controller }: ConfirmProps) => {
  const confirm = useOverlay(ConfirmOverlay);
  const handleDelete = async () => {
    if (await confirm.open({ name })) controller.close(true);
  };
  return (
    <Drawer {...controller.rootProps} data-testid='panel'>
      <DrawerContent>
        <DrawerBody>
          <Button data-testid='panel-delete' onClick={handleDelete}>
            Delete
          </Button>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
const DeletingDrawerOverlay = defineOverlay(async () => DeletingDrawer);

interface OpenerProps {
  name?: string;
  onResult: (result?: boolean) => void;
  /** A variant of ConfirmOverlay, for the tests that need one. */
  definition?: typeof ConfirmOverlay;
}
const Opener = ({ name = 'Jane', onResult, definition = ConfirmOverlay }: OpenerProps) => {
  const confirm = useOverlay(definition);
  const handleClick = async () => onResult(await confirm.open({ name }));
  return (
    <Button data-testid='open' onClick={handleClick}>
      Open
    </Button>
  );
};

/** Opens the confirm and waits until its content is on screen. */
const openConfirm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByTestId('open'));
  return screen.findByTestId('confirm--content');
};

describe('OverlayProvider and useOverlay', () => {
  // Before each test, not after: RTL's cleanup unmounts the last tree after this file's afterEach.
  beforeEach(() => {
    unmountSpy.mockClear();
  });

  afterEach(() => {
    rs.useRealTimers();
    rs.restoreAllMocks();
  });

  it('opens the overlay with its payload and resolves the value passed to close', async () => {
    const user = userEvent.setup();
    const onResult = rs.fn();
    render(
      <OverlayProvider>
        <Opener onResult={onResult} />
      </OverlayProvider>,
    );

    await user.click(screen.getByTestId('open'));
    expect(await screen.findByTestId('confirm--title')).toHaveTextContent('Delete Jane? (none)');
    await user.click(screen.getByTestId('confirm-ok'));

    await waitFor(() => expect(onResult).toHaveBeenCalledExactlyOnceWith(true));
    await waitFor(() => expect(screen.queryByTestId('confirm--content')).toBeNull());
  });

  it('resolves undefined when the user dismisses with Escape', async () => {
    const user = userEvent.setup();
    const onResult = rs.fn();
    render(
      <OverlayProvider>
        <Opener onResult={onResult} />
      </OverlayProvider>,
    );

    await openConfirm(user);
    await flushLayers();
    await user.keyboard('{Escape}');

    await waitFor(() => expect(onResult).toHaveBeenCalledExactlyOnceWith(undefined));
  });

  it('keeps the payload and content while the overlay animates out', async () => {
    animateExit('[data-testid="confirm--content"]');
    const user = userEvent.setup();
    render(
      <OverlayProvider>
        <Opener onResult={rs.fn()} />
      </OverlayProvider>,
    );
    await openConfirm(user);

    // zag applies a close one microtask later, so the click must be awaited.
    await user.click(screen.getByTestId('confirm-ok'));

    const content = screen.getByTestId('confirm--content');
    expect(screen.getByTestId('confirm--title')).toHaveTextContent('Delete Jane? (none)');
    expect(content).toHaveAttribute('data-state', 'closed');
    // zag starts tracking the exit animation one frame after the close; an earlier end is lost.
    await flushLayers();
    fireEvent.animationEnd(content);
    await waitFor(() => expect(screen.queryByTestId('confirm--content')).toBeNull());
  });

  it('removes the instance on onExitComplete, not on the fallback timer', async () => {
    const user = userEvent.setup();
    render(
      <OverlayProvider>
        <Opener definition={TrackedOverlay} onResult={rs.fn()} />
      </OverlayProvider>,
    );
    await openConfirm(user);
    await flushLayers();

    rs.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    fireEvent.click(screen.getByTestId('confirm-ok'));
    // The close put its fallback timer on the fake clock, and useRealTimers discards that clock:
    // the fallback can never fire. (RTL's waitFor cannot run under a faked setTimeout.)
    rs.useRealTimers();

    await waitFor(() => expect(unmountSpy).toHaveBeenCalled());
  });

  it('drops the instance after the fallback when the root does not forward onExitComplete', async () => {
    const user = userEvent.setup();
    render(
      <OverlayProvider>
        <Opener definition={NoExitOverlay} onResult={rs.fn()} />
      </OverlayProvider>,
    );
    await openConfirm(user);
    await flushLayers();

    rs.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    fireEvent.click(screen.getByTestId('confirm-ok'));
    expect(unmountSpy).not.toHaveBeenCalled();
    act(() => rs.advanceTimersByTime(REMOVE_FALLBACK_MS));

    expect(unmountSpy).toHaveBeenCalled();
  });

  it('an overlay that suspends above its root delays only itself', async () => {
    const user = userEvent.setup();
    let resolveGate: (module: { default: typeof ConfirmDialog }) => void = () => undefined;
    const gate = new Promise<{ default: typeof ConfirmDialog }>(resolve => {
      resolveGate = resolve;
    });
    const LazyOverlay = defineOverlay(
      async () => lazy(() => gate) as unknown as typeof ConfirmDialog,
    );
    render(
      <Suspense fallback={<span data-testid='outer-fallback' />}>
        <span data-testid='page' />
        <OverlayProvider>
          <Opener definition={LazyOverlay} onResult={rs.fn()} />
        </OverlayProvider>
      </Suspense>,
    );

    await user.click(screen.getByTestId('open'));
    await flushLayers();
    expect(screen.queryByTestId('outer-fallback')).toBeNull();
    expect(screen.getByTestId('page')).toBeVisible();
    expect(screen.queryByTestId('confirm--content')).toBeNull();

    await act(async () => resolveGate({ default: ConfirmDialog }));

    expect(await screen.findByTestId('confirm--content')).toBeInTheDocument();
    expect(screen.queryByTestId('outer-fallback')).toBeNull();
    expect(screen.getByTestId('page')).toBeVisible();
  });

  it('keeps open overlays when a Suspense boundary above the provider re-suspends', async () => {
    const user = userEvent.setup();
    const onResult = rs.fn();
    let resolveSection: (module: { default: () => ReactNode }) => void = () => undefined;
    const section = new Promise<{ default: () => ReactNode }>(resolve => {
      resolveSection = resolve;
    });
    const LazySection = lazy(() => section);
    const Page = ({ show }: { show: boolean }) => (
      <Suspense fallback={<span data-testid='outer-fallback' />}>
        <OverlayProvider>
          <Opener onResult={onResult} />
          {show && <LazySection />}
        </OverlayProvider>
      </Suspense>
    );
    const { rerender } = render(<Page show={false} />);
    await openConfirm(user);
    await flushLayers();

    rerender(<Page show />);
    expect(await screen.findByTestId('outer-fallback')).toBeInTheDocument();
    await flushLayers();
    expect(onResult).not.toHaveBeenCalled();

    await act(async () => resolveSection({ default: () => <span data-testid='section' /> }));
    expect(await screen.findByTestId('section')).toBeInTheDocument();
    expect(screen.getByTestId('confirm--content')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('confirm-ok'));
    await waitFor(() => expect(onResult).toHaveBeenCalledExactlyOnceWith(true));
  });

  // StrictMode replays the effects of a subtree that a Suspense boundary reveals again, including
  // the provider's passive cleanup. The body scroll lock is not asserted: a plain Dialog can leak it
  // after a Suspense hide and reveal, which is a separate bug.
  it('keeps open overlays when a Suspense boundary above the provider re-suspends under StrictMode', async () => {
    const user = userEvent.setup();
    const onResult = rs.fn();
    let resolveSection: (module: { default: () => ReactNode }) => void = () => undefined;
    const section = new Promise<{ default: () => ReactNode }>(resolve => {
      resolveSection = resolve;
    });
    const LazySection = lazy(() => section);
    const Page = ({ show }: { show: boolean }) => (
      <StrictMode>
        <Suspense fallback={<span data-testid='outer-fallback' />}>
          <OverlayProvider>
            <Opener definition={PanelOverlay} onResult={onResult} />
            {show && <LazySection />}
          </OverlayProvider>
        </Suspense>
      </StrictMode>
    );
    const { rerender } = render(<Page show={false} />);
    await user.click(screen.getByTestId('open'));
    await screen.findByTestId('panel--content');
    await flushLayers();

    rerender(<Page show />);
    expect(await screen.findByTestId('outer-fallback')).toBeInTheDocument();
    await flushLayers();

    await act(async () => resolveSection({ default: () => <span data-testid='section' /> }));
    expect(await screen.findByTestId('section')).toBeInTheDocument();
    await flushLayers();
    expect(screen.getByTestId('panel--content')).toBeInTheDocument();
    expect(onResult).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('panel-done'));
    await waitFor(() => expect(onResult).toHaveBeenCalledExactlyOnceWith(true));
  });

  it('reports a render error, settles undefined and keeps other overlays open', async () => {
    rs.spyOn(console, 'error').mockImplementation(() => undefined);
    const user = userEvent.setup();
    const onError = rs.fn();
    const onBoomResult = rs.fn();
    const boom = new Error('boom');
    const BoomDialog = (_: OverlayProps): ReactNode => {
      throw boom;
    };
    const BoomOverlay = defineOverlay(async () => BoomDialog);
    const BoomOpener = () => {
      const overlay = useOverlay(BoomOverlay);
      const handleClick = async () => onBoomResult(await overlay.open());
      return (
        <Button data-testid='open-boom' onClick={handleClick}>
          Boom
        </Button>
      );
    };
    render(
      <OverlayProvider onError={onError}>
        <Opener onResult={rs.fn()} />
        <BoomOpener />
      </OverlayProvider>,
    );
    await openConfirm(user);
    await flushLayers();

    // A click only: user.click would also press the pointer outside the modal confirm and dismiss it.
    await act(async () => {
      fireEvent.click(screen.getByTestId('open-boom'));
    });

    await waitFor(() => expect(onBoomResult).toHaveBeenCalledExactlyOnceWith(undefined));
    expect(onError).toHaveBeenCalledExactlyOnceWith(boom);
    await flushLayers();
    expect(screen.getByTestId('confirm--content')).toHaveAttribute('data-state', 'open');
  });

  it('resolves the original caller after the opener unmounts', async () => {
    const user = userEvent.setup();
    const onResult = rs.fn();
    const { rerender } = render(
      <OverlayProvider>
        <Opener onResult={onResult} />
      </OverlayProvider>,
    );
    await openConfirm(user);

    rerender(<OverlayProvider>{null}</OverlayProvider>);
    await user.click(screen.getByTestId('confirm-ok'));

    await waitFor(() => expect(onResult).toHaveBeenCalledExactlyOnceWith(true));
  });

  it('settles open overlays undefined when the provider unmounts', async () => {
    const user = userEvent.setup();
    const onResult = rs.fn();
    const { unmount } = render(
      <OverlayProvider>
        <Opener onResult={onResult} />
      </OverlayProvider>,
    );
    await openConfirm(user);

    unmount();

    await waitFor(() => expect(onResult).toHaveBeenCalledExactlyOnceWith(undefined));
  });

  it('opens a chained overlay while the first is still exiting', async () => {
    animateExit('[data-testid="confirm--content"]');
    const user = userEvent.setup();
    const ChainOpener = () => {
      const confirm = useOverlay(ConfirmOverlay);
      const info = useOverlay(InfoOverlay);
      const handleClick = async () => {
        if (await confirm.open({ name: 'Jane' })) await info.open();
      };
      return (
        <Button data-testid='open' onClick={handleClick}>
          Open
        </Button>
      );
    };
    render(
      <OverlayProvider>
        <ChainOpener />
      </OverlayProvider>,
    );
    await openConfirm(user);

    await user.click(screen.getByTestId('confirm-ok'));

    expect(await screen.findByTestId('info--content')).toBeInTheDocument();
    const closing = screen.getByTestId('confirm--content');
    expect(closing).toHaveAttribute('data-state', 'closed');
    await flushLayers();
    fireEvent.animationEnd(closing);
    await waitFor(() => expect(screen.queryByTestId('confirm--content')).toBeNull());
    expect(screen.getByTestId('info--content')).toBeInTheDocument();
  });

  it('keeps the original payload when the opener re-renders', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <OverlayProvider>
        <Opener onResult={rs.fn()} />
      </OverlayProvider>,
    );
    await openConfirm(user);

    rerender(
      <OverlayProvider>
        <Opener name='John' onResult={rs.fn()} />
      </OverlayProvider>,
    );

    expect(screen.getByTestId('confirm--title')).toHaveTextContent('Delete Jane? (none)');
  });

  it('opens in the nearest provider', async () => {
    const user = userEvent.setup();
    render(
      <OverlayProvider>
        <Marker.Provider value='app'>
          <OverlayProvider>
            <Opener onResult={rs.fn()} />
          </OverlayProvider>
        </Marker.Provider>
      </OverlayProvider>,
    );

    await openConfirm(user);

    expect(screen.getByTestId('confirm--title')).toHaveTextContent('Delete Jane? (app)');
  });

  it('falls through to an outer provider when the subtree has none', async () => {
    const user = userEvent.setup();
    render(
      <OverlayProvider>
        <Marker.Provider value='page'>
          <Opener onResult={rs.fn()} />
        </Marker.Provider>
      </OverlayProvider>,
    );

    await openConfirm(user);

    expect(screen.getByTestId('confirm--title')).toHaveTextContent('Delete Jane? (none)');
  });

  it('throws when useOverlay has no provider', () => {
    rs.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<Opener onResult={rs.fn()} />)).toThrow(
      /^useOverlay must be used inside an <OverlayProvider>$/,
    );
  });

  it('keeps an overlay that a child opens from its mount effect under StrictMode', async () => {
    const OpenOnMount = () => {
      const confirm = useOverlay(ConfirmOverlay);
      useEffect(() => {
        confirm.open({ name: 'Jane' });
      }, [confirm]);
      return null;
    };
    render(
      <StrictMode>
        <OverlayProvider>
          <OpenOnMount />
        </OverlayProvider>
      </StrictMode>,
    );

    await flushLayers();

    expect(screen.getByTestId('confirm--content')).toBeInTheDocument();
  });

  it('keeps an overlay that a child opens from its layout effect under StrictMode', async () => {
    const OpenOnLayout = () => {
      const confirm = useOverlay(ConfirmOverlay);
      useLayoutEffect(() => {
        confirm.open({ name: 'Jane' });
      }, [confirm]);
      return null;
    };
    render(
      <StrictMode>
        <OverlayProvider>
          <OpenOnLayout />
        </OverlayProvider>
      </StrictMode>,
    );

    await flushLayers();

    expect(screen.getByTestId('confirm--content')).toBeInTheDocument();
  });

  it('cleans up the focus trap, scroll lock and inert markers under StrictMode', async () => {
    const user = userEvent.setup();
    render(
      <StrictMode>
        <OverlayProvider>
          <Opener onResult={rs.fn()} />
        </OverlayProvider>
      </StrictMode>,
    );
    await openConfirm(user);
    await flushLayers();
    // A root that reported an exit while open would drop the instance.
    expect(screen.getByTestId('confirm--content')).toHaveAttribute('data-state', 'open');

    await user.click(screen.getByTestId('confirm-ok'));
    await waitFor(() => expect(screen.queryByTestId('confirm--content')).toBeNull());
    await flushLayers();

    expect(document.body).not.toHaveAttribute('data-scroll-lock');
    expect(document.body).not.toHaveAttribute('data-inert');
    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.pointerEvents).toBe('');
    expect(document.querySelector('[data-aria-hidden], [data-inerted]')).toBeNull();
    await waitFor(() => expect(screen.getByTestId('open')).toHaveFocus());
  });

  it('returns focus to the opener when a confirm closes the drawer that opened it', async () => {
    animateExit('[data-testid="panel--content"], [data-testid="confirm--content"]');
    const user = userEvent.setup();
    render(
      <OverlayProvider>
        <Opener definition={DeletingDrawerOverlay} onResult={rs.fn()} />
      </OverlayProvider>,
    );
    await user.click(screen.getByTestId('open'));
    const panel = await screen.findByTestId('panel--content');
    await flushLayers();
    await user.click(screen.getByTestId('panel-delete'));
    const confirm = await screen.findByTestId('confirm--content');
    await flushLayers();

    // A browser click, outside act(): act() commits the confirm's close before the drawer's
    // close runs, which hides the order the two closes land in.
    const actEnvironment = Reflect.get(globalThis, 'IS_REACT_ACT_ENVIRONMENT');
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', false);
    try {
      screen.getByTestId('confirm-ok').click();
      await waitFor(() => expect(panel).toHaveAttribute('data-state', 'closed'));
      await flushLayers();
    } finally {
      Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', actEnvironment);
    }
    fireEvent.animationEnd(confirm);
    fireEvent.animationEnd(panel);

    await waitFor(() => expect(screen.queryByTestId('panel--content')).toBeNull());
    await waitFor(() => expect(screen.getByTestId('open')).toHaveFocus());
  });

  it('closes a managed dialog when its drawer closes from outside, through a nested provider', async () => {
    const user = userEvent.setup();
    const onResult = rs.fn();
    const Detail = ({ open }: { open: boolean }) => (
      <Drawer open={open} data-testid='detail'>
        <DrawerContent>
          <OverlayProvider>
            <DrawerBody>
              <Opener onResult={onResult} />
            </DrawerBody>
          </OverlayProvider>
        </DrawerContent>
      </Drawer>
    );
    const { rerender } = render(<Detail open />);
    await flushLayers();
    await openConfirm(user);
    await flushLayers();

    rerender(<Detail open={false} />);

    await waitFor(() => expect(screen.queryByTestId('confirm--content')).toBeNull());
    await waitFor(() => expect(onResult).toHaveBeenCalledExactlyOnceWith(undefined));
  });

  it('leaves the dialog open when it was opened through the app-level provider', async () => {
    const user = userEvent.setup();
    const onResult = rs.fn();
    const Detail = ({ open }: { open: boolean }) => (
      <OverlayProvider>
        <Drawer open={open} data-testid='detail'>
          <DrawerContent>
            <DrawerBody>
              <Opener onResult={onResult} />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </OverlayProvider>
    );
    const { rerender } = render(<Detail open />);
    await flushLayers();
    await openConfirm(user);
    await flushLayers();

    rerender(<Detail open={false} />);
    await flushLayers();

    // The documented limit: an app-level overlay is no React descendant of the drawer.
    expect(screen.queryByTestId('detail--content')).toBeNull();
    expect(screen.getByTestId('confirm--content')).toHaveAttribute('data-state', 'open');
    expect(onResult).not.toHaveBeenCalled();
  });
});

describe('closeOnChange', () => {
  it('closes open overlays when closeOnChange changes', async () => {
    const user = userEvent.setup();
    const onResult = rs.fn();
    const { rerender } = render(
      <OverlayProvider closeOnChange='/users'>
        <Opener onResult={onResult} />
      </OverlayProvider>,
    );
    await openConfirm(user);
    await flushLayers();

    rerender(
      <OverlayProvider closeOnChange='/roles'>
        <Opener onResult={onResult} />
      </OverlayProvider>,
    );

    await waitFor(() => expect(screen.queryByTestId('confirm--content')).toBeNull());
    await waitFor(() => expect(onResult).toHaveBeenCalledExactlyOnceWith(undefined));
  });

  it('keeps an overlay that the new page opens from a mount effect in the same commit', async () => {
    const PageA = () => <span data-testid='page-a' />;
    const PageB = () => {
      const info = useOverlay(InfoOverlay);
      useEffect(() => {
        info.open();
      }, [info]);
      return <span data-testid='page-b' />;
    };
    const App = ({ page }: { page: 'a' | 'b' }) => (
      <OverlayProvider closeOnChange={page}>{page === 'b' ? <PageB /> : <PageA />}</OverlayProvider>
    );
    const { rerender } = render(<App page='a' />);

    rerender(<App page='b' />);
    await flushLayers();

    expect(screen.getByTestId('info--content')).toBeInTheDocument();
  });

  // Smoke test: StrictMode replays the provider's effects at mount, before anything is open, so
  // this cannot catch a missing same-key guard. That is pinned by overlayStore.test.ts
  // ('setCloseKey records the first key and ignores an unchanged one') and by the Suspense
  // re-suspend tests above.
  it('does not close overlays on the StrictMode effect replay', async () => {
    const user = userEvent.setup();
    const onResult = rs.fn();
    render(
      <StrictMode>
        <OverlayProvider closeOnChange='a'>
          <Opener onResult={onResult} />
        </OverlayProvider>
      </StrictMode>,
    );
    await openConfirm(user);
    await flushLayers();

    expect(screen.getByTestId('confirm--content')).toHaveAttribute('data-state', 'open');
    expect(onResult).not.toHaveBeenCalled();
  });

  it('drops an overlay still loading when closeOnChange changes', async () => {
    const user = userEvent.setup();
    const onResult = rs.fn();
    let resolveCode: (component: typeof ConfirmDialog) => void = () => undefined;
    const code = new Promise<typeof ConfirmDialog>(resolve => {
      resolveCode = resolve;
    });
    const SlowOverlay = defineOverlay(() => code);
    const { rerender } = render(
      <OverlayProvider closeOnChange='/users'>
        <Opener definition={SlowOverlay} onResult={onResult} />
      </OverlayProvider>,
    );
    await user.click(screen.getByTestId('open'));

    rerender(
      <OverlayProvider closeOnChange='/roles'>
        <Opener definition={SlowOverlay} onResult={onResult} />
      </OverlayProvider>,
    );
    await act(async () => resolveCode(ConfirmDialog));
    await flushLayers();

    expect(screen.queryByTestId('confirm--content')).toBeNull();
    await waitFor(() => expect(onResult).toHaveBeenCalledExactlyOnceWith(undefined));
  });
});
