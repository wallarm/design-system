import {
  type ChangeEvent,
  Component,
  type FC,
  type ReactNode,
  StrictMode,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../Dialog';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '../Drawer';
import { Input } from '../Input';
import { Skeleton } from '../Skeleton';
import { defineOverlay } from './defineOverlay';
import { lazyOverlayBody } from './lazyOverlayBody';
import { OverlayProvider } from './OverlayProvider';
import type { OverlayController, OverlayDefinition, OverlayProps } from './types';
import { useOverlay } from './useOverlay';

// The same two helpers as in OverlayManager.test.tsx.
// zag registers a dismissable layer through raf / nextTick / setTimeout(0); give every one a turn.
const flushLayers = async () => {
  for (let i = 0; i < 10; i++) {
    await act(() => new Promise(resolve => setTimeout(resolve, 20)));
  }
};

/** Makes the matching nodes "animate" out, so their exit waits for an `animationend`. */
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

// Components made in a factory hold no inline closures: React Compiler moves a closure that
// captures nothing from its component to module scope, out of reach of the factory's variables.

interface EditFormProps {
  name: string;
  controller: OverlayController<string>;
  /** Changes when the test re-renders the shell. */
  tick?: number;
}

/** The heavy part: everything below the header. */
const EditForm: FC<EditFormProps> = ({ name, controller }) => {
  const handleSave = () => controller.close(`saved ${name}`);
  return (
    <>
      <DrawerBody>
        <span data-testid='form-field'>{name}</span>
      </DrawerBody>
      <DrawerFooter>
        <Button data-testid='form-save' onClick={handleSave}>
          Save
        </Button>
      </DrawerFooter>
    </>
  );
};

const renderError = new Error('body render');
/** A heavy part whose code loads but throws when it renders. */
const ThrowingForm = (_: EditFormProps): ReactNode => {
  throw renderError;
};

/** Called each time a skeleton commits. */
const skeletonMounts = rs.fn();
const FormSkeleton = () => {
  useEffect(() => {
    skeletonMounts();
  }, []);
  return (
    <DrawerBody>
      <Skeleton width='100%' height='36px' data-testid='form-skeleton' />
    </DrawerBody>
  );
};

/** A loader whose every call waits until the test resolves or rejects it. */
const createDeferredLoad = <T,>() => {
  let pending: { resolve: (value: T) => void; reject: (error: unknown) => void } | undefined;
  const load = rs.fn(
    () =>
      new Promise<T>((resolve, reject) => {
        pending = { resolve, reject };
      }),
  );
  return {
    load,
    resolve: (value: T) => pending?.resolve(value),
    reject: (error: unknown) => pending?.reject(error),
  };
};

interface SplitProps extends OverlayProps<string> {
  name: string;
}

/** An outside store whose every bump re-renders the split drawers' bodies. */
const tick = { value: 0, listeners: new Set<() => void>() };
const subscribeTick = (listener: () => void) => {
  tick.listeners.add(listener);
  return () => {
    tick.listeners.delete(listener);
  };
};
const getTick = () => tick.value;
const bumpTick = () => {
  tick.value += 1;
  for (const listener of tick.listeners) listener();
};

/** A split drawer with its own body cache, as a fresh module would have. */
const createSplitDrawer = () => {
  const body = createDeferredLoad<FC<EditFormProps>>();
  const Body = lazyOverlayBody(body.load);
  const SplitDrawer = ({ name, controller }: SplitProps) => {
    const tickValue = useSyncExternalStore(subscribeTick, getTick, getTick);
    return (
      <Drawer {...controller.rootProps} data-testid='split'>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit {name}</DrawerTitle>
            <DrawerDescription>Change the name</DrawerDescription>
          </DrawerHeader>
          <Body fallback={<FormSkeleton />} name={name} tick={tickValue} controller={controller} />
        </DrawerContent>
      </Drawer>
    );
  };
  const Overlay = defineOverlay(async () => {
    Body.preload();
    return SplitDrawer;
  });
  return { ...body, Body, Overlay };
};

/** The same split, in a centred Dialog. */
const createSplitDialog = () => {
  const body = createDeferredLoad<FC<EditFormProps>>();
  const Body = lazyOverlayBody(body.load);
  const SplitDialog = ({ name, controller }: SplitProps) => (
    <Dialog {...controller.rootProps} data-testid='split'>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {name}</DialogTitle>
          <DialogDescription>Change the name</DialogDescription>
        </DialogHeader>
        <Body fallback={<FormSkeleton />} name={name} controller={controller} />
      </DialogContent>
    </Dialog>
  );
  const Overlay = defineOverlay(async () => {
    Body.preload();
    return SplitDialog;
  });
  return { ...body, Body, Overlay };
};

interface OpenerProps {
  definition: OverlayDefinition<{ name: string }, string>;
  onResult: (result?: string) => void;
}
const Opener = ({ definition, onResult }: OpenerProps) => {
  const overlay = useOverlay(definition);
  const handleClick = async () => onResult(await overlay.open({ name: 'Jane' }));
  return (
    <Button data-testid='open' onClick={handleClick}>
      Open
    </Button>
  );
};

interface GuardedFormProps {
  onDirtyChange: (dirty: boolean) => void;
}
/** A lazy part that owns its field and reports dirtiness from its change handler. */
const GuardedFormBody = ({ onDirtyChange }: GuardedFormProps) => {
  const [value, setValue] = useState('');
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    onDirtyChange(event.target.value !== '');
  };
  return (
    <DrawerBody>
      <Input value={value} onChange={handleChange} data-testid='guarded-input' />
    </DrawerBody>
  );
};
const GuardedForm = lazyOverlayBody(async () => GuardedFormBody);

const GuardDialog = ({ controller }: OverlayProps<boolean>) => (
  <Dialog {...controller.rootProps} data-testid='guard'>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Discard changes?</DialogTitle>
      </DialogHeader>
    </DialogContent>
  </Dialog>
);
const GuardOverlay = defineOverlay(async () => GuardDialog);

/** The shell keeps the guard: Escape, the X and an outside click all pass its onOpenChange. */
const GuardedDrawer = ({ name, controller }: SplitProps) => {
  const guard = useOverlay(GuardOverlay);
  const [isDirty, setIsDirty] = useState(false);
  const handleOpenChange = async (open: boolean) => {
    if (open || !isDirty) {
      controller.rootProps.onOpenChange(open);
      return;
    }
    if (await guard.open()) controller.close();
  };
  return (
    <Drawer {...controller.rootProps} onOpenChange={handleOpenChange} data-testid='guarded'>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit {name}</DrawerTitle>
        </DrawerHeader>
        <GuardedForm fallback={<FormSkeleton />} onDirtyChange={setIsDirty} />
      </DrawerContent>
    </Drawer>
  );
};
const GuardedOverlay = defineOverlay(async () => {
  GuardedForm.preload();
  return GuardedDrawer;
});

class AppBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <span data-testid='app-error' /> : this.props.children;
  }
}

describe('lazyOverlayBody', () => {
  beforeEach(() => {
    skeletonMounts.mockClear();
  });

  afterEach(() => {
    rs.restoreAllMocks();
  });

  it.each([
    ['Drawer', createSplitDrawer],
    ['Dialog', createSplitDialog],
  ])(
    '%s: shows the header and the skeleton at once, then swaps the body in place',
    async (_, createSplit) => {
      const user = userEvent.setup();
      const split = createSplit();
      render(
        <OverlayProvider>
          <Opener definition={split.Overlay} onResult={rs.fn()} />
        </OverlayProvider>,
      );

      await user.click(screen.getByTestId('open'));
      const content = await screen.findByTestId('split--content');
      // The shell's first commit: the real header, the skeleton and the loading status.
      const title = screen.getByTestId('split--title');
      expect(title).toHaveTextContent('Edit Jane');
      expect(screen.getByTestId('form-skeleton')).toBeInTheDocument();
      const status = screen.getByTestId('split--loading');
      expect(status).toHaveAttribute('role', 'status');
      expect(status).not.toHaveAttribute('aria-busy');
      // Empty when it mounts: screen readers speak a live region's changes, not what it starts with.
      expect(status).toBeEmptyDOMElement();
      expect(screen.queryByTestId('form-field')).toBeNull();
      await flushLayers();
      expect(status).toHaveTextContent('Loading');
      expect(content).toHaveAttribute('aria-labelledby', title.id);
      expect(content).toHaveAttribute(
        'aria-describedby',
        screen.getByTestId('split--description').id,
      );
      const focused = document.activeElement;
      expect(content.contains(focused)).toBe(true);

      await act(async () => split.resolve(EditForm));

      expect(await screen.findByTestId('form-field')).toHaveTextContent('Jane');
      // Swapped below the header: the same nodes, links and focus.
      expect(screen.getByTestId('split--content')).toBe(content);
      expect(screen.getByTestId('split--title')).toBe(title);
      expect(content).toHaveAttribute('aria-labelledby', title.id);
      expect(content).toHaveAttribute('data-state', 'open');
      expect(document.activeElement).toBe(focused);
      expect(screen.queryByTestId('form-skeleton')).toBeNull();
      expect(screen.queryByTestId('split--loading')).toBeNull();
      expect(split.load).toHaveBeenCalledTimes(1);
    },
  );

  it('renders the body in the first commit once its code is loaded', async () => {
    const user = userEvent.setup();
    const onResult = rs.fn();
    const split = createSplitDrawer();
    render(
      <OverlayProvider>
        <Opener definition={split.Overlay} onResult={onResult} />
      </OverlayProvider>,
    );
    await user.click(screen.getByTestId('open'));
    await act(async () => split.resolve(EditForm));
    await user.click(await screen.findByTestId('form-save'));
    await waitFor(() => expect(onResult).toHaveBeenCalledExactlyOnceWith('saved Jane'));
    await waitFor(() => expect(screen.queryByTestId('split--content')).toBeNull());
    skeletonMounts.mockClear();

    await user.click(screen.getByTestId('open'));

    await screen.findByTestId('split--content');
    expect(screen.getByTestId('form-field')).toBeInTheDocument();
    expect(screen.queryByTestId('split--loading')).toBeNull();
    expect(skeletonMounts).not.toHaveBeenCalled();
    expect(split.load).toHaveBeenCalledTimes(1);
  });

  it('shows no skeleton when preload() finished before the first open', async () => {
    const user = userEvent.setup();
    const split = createSplitDrawer();
    render(
      <OverlayProvider>
        <Opener definition={split.Overlay} onResult={rs.fn()} />
      </OverlayProvider>,
    );
    const preloaded = split.Body.preload();
    split.resolve(EditForm);
    await preloaded;

    await user.click(screen.getByTestId('open'));

    await screen.findByTestId('split--content');
    expect(screen.getByTestId('form-field')).toBeInTheDocument();
    expect(skeletonMounts).not.toHaveBeenCalled();
    expect(split.load).toHaveBeenCalledTimes(1);
  });

  it('resolves preload() when the load fails, and the next load tries again', async () => {
    const split = createSplitDrawer();

    const failed = split.Body.preload();
    split.reject(new Error('offline'));
    await expect(failed).resolves.toBeUndefined();

    const retried = split.Body.preload();
    expect(split.load).toHaveBeenCalledTimes(2);
    split.resolve(EditForm);
    await expect(retried).resolves.toBeUndefined();
  });

  it('closes with the exit animation when the body fails to load, and the next open loads it again', async () => {
    rs.spyOn(console, 'error').mockImplementation(() => undefined);
    animateExit('[data-testid="split--content"]');
    const user = userEvent.setup();
    const onError = rs.fn();
    const onResult = rs.fn();
    const split = createSplitDrawer();
    render(
      <OverlayProvider onError={onError}>
        <Opener definition={split.Overlay} onResult={onResult} />
      </OverlayProvider>,
    );
    await user.click(screen.getByTestId('open'));
    const content = await screen.findByTestId('split--content');
    await flushLayers();

    const loadError = new Error('body chunk');
    await act(async () => split.reject(loadError));

    await waitFor(() => expect(onResult).toHaveBeenCalledExactlyOnceWith(undefined));
    expect(onError).toHaveBeenCalledExactlyOnceWith(loadError);
    await flushLayers();
    // The exit plays over the skeleton, which stays in place of the body.
    expect(content).toHaveAttribute('data-state', 'closed');
    expect(content).toBeInTheDocument();
    expect(screen.getByTestId('form-skeleton')).toBeInTheDocument();
    fireEvent.animationEnd(content);
    await waitFor(() => expect(screen.queryByTestId('split--content')).toBeNull());
    await flushLayers();
    expect(document.body).not.toHaveAttribute('data-scroll-lock');
    expect(document.querySelector('[data-aria-hidden], [data-inerted]')).toBeNull();
    await waitFor(() => expect(screen.getByTestId('open')).toHaveFocus());

    await user.click(screen.getByTestId('open'));
    await screen.findByTestId('split--content');
    expect(split.load).toHaveBeenCalledTimes(2);
    await act(async () => split.resolve(EditForm));
    expect(await screen.findByTestId('form-field')).toBeInTheDocument();
  });

  it('closes when the load fails even if the shell re-renders before React retries', async () => {
    rs.spyOn(console, 'error').mockImplementation(() => undefined);
    const user = userEvent.setup();
    const onResult = rs.fn();
    const split = createSplitDrawer();
    render(
      <OverlayProvider onError={rs.fn()}>
        <Opener definition={split.Overlay} onResult={onResult} />
      </OverlayProvider>,
    );
    await user.click(screen.getByTestId('open'));
    await screen.findByTestId('split--content');
    const pendingLoad = split.load.mock.results[0]?.value as Promise<unknown>;

    // Outside act(), as in a browser: the store bump lands after the failed load has swapped in a
    // fresh lazy for the next open, and before React retries the boundary. The mount keeps its
    // failed lazy, so the failure still reaches the boundary instead of starting another load.
    // (With 'use no memo', an unpinned `getBody()` call fails here; compiled, its memo hides it.)
    const actEnvironment = Reflect.get(globalThis, 'IS_REACT_ACT_ENVIRONMENT');
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', false);
    try {
      pendingLoad.catch(bumpTick);
      split.reject(new Error('body chunk'));
      await waitFor(() => expect(onResult).toHaveBeenCalledExactlyOnceWith(undefined));
    } finally {
      Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', actEnvironment);
    }
    expect(split.load).toHaveBeenCalledTimes(1);
  });

  it('closes with the exit animation when the body throws while rendering', async () => {
    rs.spyOn(console, 'error').mockImplementation(() => undefined);
    animateExit('[data-testid="split--content"]');
    const user = userEvent.setup();
    const onError = rs.fn();
    const onResult = rs.fn();
    const split = createSplitDrawer();
    render(
      <OverlayProvider onError={onError}>
        <Opener definition={split.Overlay} onResult={onResult} />
      </OverlayProvider>,
    );
    await user.click(screen.getByTestId('open'));
    const content = await screen.findByTestId('split--content');

    await act(async () => split.resolve(ThrowingForm));

    await waitFor(() => expect(onResult).toHaveBeenCalledExactlyOnceWith(undefined));
    expect(onError).toHaveBeenCalledExactlyOnceWith(renderError);
    await flushLayers();
    expect(content).toHaveAttribute('data-state', 'closed');
    expect(screen.getByTestId('form-skeleton')).toBeInTheDocument();
    fireEvent.animationEnd(content);
    await waitFor(() => expect(screen.queryByTestId('split--content')).toBeNull());
  });

  it('keeps the exit and reports once when the body fails after a dismissal', async () => {
    rs.spyOn(console, 'error').mockImplementation(() => undefined);
    animateExit('[data-testid="split--content"]');
    const user = userEvent.setup();
    const onError = rs.fn();
    const onResult = rs.fn();
    const split = createSplitDrawer();
    render(
      <OverlayProvider onError={onError}>
        <Opener definition={split.Overlay} onResult={onResult} />
      </OverlayProvider>,
    );
    await user.click(screen.getByTestId('open'));
    const content = await screen.findByTestId('split--content');
    await flushLayers();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(onResult).toHaveBeenCalledExactlyOnceWith(undefined));
    await flushLayers();
    expect(content).toHaveAttribute('data-state', 'closed');

    const loadError = new Error('body chunk');
    await act(async () => split.reject(loadError));
    await flushLayers();

    expect(onError).toHaveBeenCalledExactlyOnceWith(loadError);
    expect(content).toBeInTheDocument();
    fireEvent.animationEnd(content);
    await waitFor(() => expect(screen.queryByTestId('split--content')).toBeNull());
    expect(onResult).toHaveBeenCalledTimes(1);
  });

  it('resolves undefined when closeOnChange changes while the body loads, and ignores the late body', async () => {
    const user = userEvent.setup();
    const onError = rs.fn();
    const onResult = rs.fn();
    const split = createSplitDrawer();
    const renderPage = (page: string) => (
      <OverlayProvider closeOnChange={page} onError={onError}>
        <Opener definition={split.Overlay} onResult={onResult} />
      </OverlayProvider>
    );
    const { rerender } = render(renderPage('a'));
    await user.click(screen.getByTestId('open'));
    await screen.findByTestId('split--content');

    rerender(renderPage('b'));

    await waitFor(() => expect(onResult).toHaveBeenCalledExactlyOnceWith(undefined));
    await waitFor(() => expect(screen.queryByTestId('split--content')).toBeNull());
    await act(async () => split.resolve(EditForm));
    expect(onError).not.toHaveBeenCalled();
    expect(screen.queryByTestId('form-field')).toBeNull();
  });

  it('lets the shell guard a dirty form that lives in the lazy body', async () => {
    const user = userEvent.setup();
    render(
      <OverlayProvider>
        <Opener definition={GuardedOverlay} onResult={rs.fn()} />
      </OverlayProvider>,
    );
    await user.click(screen.getByTestId('open'));
    await user.type(await screen.findByTestId('guarded-input'), 'x');
    await flushLayers();

    await user.keyboard('{Escape}');

    expect(await screen.findByTestId('guard--content')).toBeInTheDocument();
    expect(screen.getByTestId('guarded--content')).toHaveAttribute('data-state', 'open');
  });

  it('loads once and leaves no focus trap, scroll lock or inert markers under StrictMode', async () => {
    const user = userEvent.setup();
    const split = createSplitDrawer();
    render(
      <StrictMode>
        <OverlayProvider>
          <Opener definition={split.Overlay} onResult={rs.fn()} />
        </OverlayProvider>
      </StrictMode>,
    );
    await user.click(screen.getByTestId('open'));
    const content = await screen.findByTestId('split--content');
    await flushLayers();
    await act(async () => split.resolve(EditForm));
    await screen.findByTestId('form-field');
    expect(screen.getByTestId('split--content')).toBe(content);
    expect(split.load).toHaveBeenCalledTimes(1);

    await user.click(screen.getByTestId('form-save'));
    await waitFor(() => expect(screen.queryByTestId('split--content')).toBeNull());
    await flushLayers();

    expect(document.body).not.toHaveAttribute('data-scroll-lock');
    expect(document.body.style.overflow).toBe('');
    expect(document.querySelector('[data-aria-hidden], [data-inerted]')).toBeNull();
    await waitFor(() => expect(screen.getByTestId('open')).toHaveFocus());
  });

  it('lets a load error reach the nearest error boundary outside a managed overlay', async () => {
    rs.spyOn(console, 'error').mockImplementation(() => undefined);
    const split = createSplitDrawer();
    const controller: OverlayController<string> = {
      rootProps: { open: true, onOpenChange: rs.fn(), onExitComplete: rs.fn() },
      close: rs.fn(),
    };
    render(
      <AppBoundary>
        <Drawer open data-testid='plain'>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Plain</DrawerTitle>
            </DrawerHeader>
            <split.Body fallback={<FormSkeleton />} name='Jane' controller={controller} />
          </DrawerContent>
        </Drawer>
      </AppBoundary>,
    );
    expect(await screen.findByTestId('form-skeleton')).toBeInTheDocument();

    await act(async () => split.reject(new Error('body chunk')));

    expect(await screen.findByTestId('app-error')).toBeInTheDocument();
  });
});
