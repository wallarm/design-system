import { useState } from 'react';
import { describe, expect, it, rs } from '@rstest/core';
import { act, fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from '../Button';
import { Dialog, DialogBody, DialogContent } from '../Dialog';
import { Drawer } from './Drawer';
import { DrawerBody } from './DrawerBody';
import { DrawerClose } from './DrawerClose';
import { DrawerContent } from './DrawerContent';
import { DrawerDescription } from './DrawerDescription';
import { DrawerFooter } from './DrawerFooter';
import { DrawerHeader } from './DrawerHeader';
import { DrawerResizeHandle } from './DrawerResizeHandle';
import { keepOpenUnlessAncestorCloses } from './DrawerRoot';
import { DrawerTitle } from './DrawerTitle';
import { DrawerTrigger } from './DrawerTrigger';

describe('Attribute pass-through', () => {
  it('forwards data-analytics-id to the DrawerTrigger <button>', () => {
    render(
      <Drawer>
        <DrawerTrigger data-testid='trigger' data-analytics-id='OPEN_DRAWER'>
          Open
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>Body</DrawerBody>
        </DrawerContent>
      </Drawer>,
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('data-analytics-id', 'OPEN_DRAWER');
  });

  it('forwards data-analytics-id to the default DrawerClose icon <button>', () => {
    render(
      <Drawer open>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
            <DrawerClose data-testid='close' data-analytics-id='CLOSE_DRAWER' />
          </DrawerHeader>
          <DrawerBody>Body</DrawerBody>
        </DrawerContent>
      </Drawer>,
    );

    const close = screen.getByTestId('close');
    expect(close.tagName).toBe('BUTTON');
    expect(close).toHaveAttribute('data-analytics-id', 'CLOSE_DRAWER');
  });

  it('preserves analytics on the cancel button via DrawerClose asChild', () => {
    render(
      <Drawer open>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>Body</DrawerBody>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button data-testid='cancel' data-analytics-id='CANCEL_DRAWER'>
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>,
    );

    const cancel = screen.getByTestId('cancel');
    expect(cancel.tagName).toBe('BUTTON');
    expect(cancel).toHaveAttribute('data-analytics-id', 'CANCEL_DRAWER');
  });
});

describe('Handler composition', () => {
  it('consumer onClick on DrawerTrigger fires alongside Ark open behavior', async () => {
    const onClick = rs.fn();

    render(
      <Drawer>
        <DrawerTrigger data-testid='trigger' onClick={onClick}>
          Open
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>Body</DrawerBody>
        </DrawerContent>
      </Drawer>,
    );

    await userEvent.click(screen.getByTestId('trigger'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Body')).toBeVisible();
  });

  it('consumer onMouseDown on DrawerResizeHandle composes with internal drag start', () => {
    const onMouseDown = rs.fn();

    render(
      <Drawer open minWidth={100}>
        <DrawerContent>
          <DrawerResizeHandle data-testid='resize' onMouseDown={onMouseDown} />
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>Body</DrawerBody>
        </DrawerContent>
      </Drawer>,
    );

    const handle = screen.getByTestId('resize');
    fireEvent.mouseDown(handle, { clientX: 500 });
    fireEvent.mouseUp(document);

    expect(onMouseDown).toHaveBeenCalledTimes(1);
  });

  it('consumer onClick on a DrawerClose asChild Button fires alongside Ark close behavior', async () => {
    const onClick = rs.fn();

    render(
      <Drawer>
        <DrawerTrigger asChild>
          <Button data-testid='trigger'>Open</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>Body</DrawerBody>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button data-testid='cancel' onClick={onClick}>
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>,
    );

    await userEvent.click(screen.getByTestId('trigger'));
    const cancel = await screen.findByTestId('cancel');

    await userEvent.click(cancel);

    expect(onClick).toHaveBeenCalledTimes(1);
    await waitForElementToBeRemoved(() => screen.queryByText('Body'));
  });
});

describe('Dismissable callbacks', () => {
  it('fires onEscapeKeyDown when the user presses Escape', async () => {
    const onEscapeKeyDown = rs.fn();

    render(
      <Drawer open onEscapeKeyDown={onEscapeKeyDown}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>Body</DrawerBody>
        </DrawerContent>
      </Drawer>,
    );

    // Ark UI's dismissable layer is registered via `defer: true` (raf) plus
    // an internal `setTimeout(0)` for the pointerdown listener — wait a tick
    // past both before firing the synthetic event.
    await screen.findByText('Body');
    await new Promise(resolve => setTimeout(resolve, 50));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    const [event] = onEscapeKeyDown.mock.calls[0] ?? [];
    expect(event).toMatchObject({ key: 'Escape' });
  });

  it('fires onInteractOutside when the user clicks outside the drawer content', async () => {
    const onInteractOutside = rs.fn();

    render(
      <Drawer open onInteractOutside={onInteractOutside}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>Body</DrawerBody>
        </DrawerContent>
      </Drawer>,
    );

    await screen.findByText('Body');
    await new Promise(resolve => setTimeout(resolve, 50));
    fireEvent.pointerDown(document.body, { clientX: 0, clientY: 0 });
    // The dismissable layer dispatches the user-facing callback via a deferred
    // custom event; let it propagate before asserting.
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(onInteractOutside).toHaveBeenCalled();
  });
});

describe('DrawerResizeHandle', () => {
  it('forwards data-analytics-id to the resize-handle <button>', () => {
    render(
      <Drawer open>
        <DrawerContent>
          <DrawerResizeHandle data-testid='resize' data-analytics-id='DRAWER_RESIZE' />
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>Body</DrawerBody>
        </DrawerContent>
      </Drawer>,
    );

    const handle = screen.getByTestId('resize');
    expect(handle.tagName).toBe('BUTTON');
    expect(handle).toHaveAttribute('data-analytics-id', 'DRAWER_RESIZE');
  });

  it('fires onResizeStart on mousedown and onResizeEnd with final width on mouseup', () => {
    const onResizeStart = rs.fn();
    const onResizeEnd = rs.fn<(width: number) => void>();

    render(
      <Drawer open minWidth={100} maxWidth={1000}>
        <DrawerContent>
          <DrawerResizeHandle
            data-testid='resize'
            onResizeStart={onResizeStart}
            onResizeEnd={onResizeEnd}
          />
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>Body</DrawerBody>
        </DrawerContent>
      </Drawer>,
    );

    const handle = screen.getByTestId('resize');

    fireEvent.mouseDown(handle, { clientX: 500 });
    expect(onResizeStart).toHaveBeenCalledTimes(1);
    expect(onResizeEnd).not.toHaveBeenCalled();

    // Moving left increases width: delta = startX - clientX = 500 - 200 = 300.
    // jsdom reports offsetWidth = 0, so startWidth = 0 and newWidth = clamp(300, 100, 1000) = 300.
    fireEvent.mouseMove(document, { clientX: 200 });
    fireEvent.mouseUp(document);

    expect(onResizeEnd).toHaveBeenCalledTimes(1);
    expect(onResizeEnd).toHaveBeenCalledWith(300);
  });
});

describe('DrawerHeader grouping of DrawerTitle / DrawerDescription', () => {
  it('stacks DrawerTitle and DrawerDescription in a column, with DrawerDescription cascading data-testid', () => {
    render(
      <Drawer data-testid='drawer' open>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
            <DrawerDescription>Supporting text</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>Body</DrawerBody>
        </DrawerContent>
      </Drawer>,
    );

    const description = screen.getByTestId('drawer--description');
    expect(description).toHaveAttribute('data-slot', 'drawer-description');
    expect(description).toHaveTextContent('Supporting text');

    const title = screen.getByText('Title');
    // Title and description share the same generated column wrapper as parent.
    expect(title.parentElement).toBe(description.parentElement);
    expect(title.parentElement?.className).toContain('flex-col');
  });

  it('keeps a trailing non-title/description child (e.g. a nested trigger) as a row sibling, not swallowed into the column', () => {
    render(
      <Drawer data-testid='drawer' open>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
            <DrawerDescription>Supporting text</DrawerDescription>
            <button type='button' data-testid='extra'>
              Extra action
            </button>
          </DrawerHeader>
          <DrawerBody>Body</DrawerBody>
        </DrawerContent>
      </Drawer>,
    );

    const description = screen.getByTestId('drawer--description');
    const extra = screen.getByTestId('extra');
    // The extra trailing child must NOT be inside the title/description column.
    expect(extra.parentElement).not.toBe(description.parentElement);
  });

  it('wires aria-describedby from the dialog content to DrawerDescription', () => {
    render(
      <Drawer open>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
            <DrawerDescription>Supporting text</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>Body</DrawerBody>
        </DrawerContent>
      </Drawer>,
    );

    const dialog = screen.getByRole('dialog');
    const describedBy = dialog.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const descriptionEl = describedBy ? document.getElementById(describedBy) : null;
    expect(descriptionEl).toHaveTextContent('Supporting text');
  });

  it('does not expose a description element when no DrawerDescription is present', () => {
    render(
      <Drawer open>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>Body</DrawerBody>
        </DrawerContent>
      </Drawer>,
    );

    // Ark's dialog machine always reserves a description id on aria-describedby,
    // whether or not a Dialog.Description is mounted — assert no element answers it.
    const describedBy = screen.getByRole('dialog').getAttribute('aria-describedby');
    const descriptionEl = describedBy ? document.getElementById(describedBy) : null;
    expect(descriptionEl).toBeNull();
  });
});

// zag registers a dismissable layer through raf / nextTick / setTimeout(0); give every one a turn.
const flushLayers = async () => {
  for (let i = 0; i < 10; i++) {
    await act(() => new Promise(resolve => setTimeout(resolve, 20)));
  }
};

describe('Overlay handoff', () => {
  // A Dialog that closes while a sibling Drawer mounts in the same commit (zag >= 1.43.1 registers
  // the drawer's layer synchronously, above the closing dialog). The drawer must be mounted
  // conditionally — an always-mounted Drawer does not hit the race.
  it('keeps a freshly mounted Drawer open when a closing Dialog hands off to it', async () => {
    const user = userEvent.setup();
    const onDrawerOpenChange = rs.fn();

    const Flow = () => {
      const [dialogOpen, setDialogOpen] = useState(true);
      const [drawerOpen, setDrawerOpen] = useState(false);
      return (
        <>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogBody>
                <Button
                  onClick={() => {
                    setDialogOpen(false);
                    setDrawerOpen(true);
                  }}
                >
                  Continue
                </Button>
              </DialogBody>
            </DialogContent>
          </Dialog>
          {drawerOpen && (
            <Drawer
              open
              onOpenChange={open => {
                onDrawerOpenChange(open);
                setDrawerOpen(open);
              }}
            >
              <DrawerContent>
                <DrawerBody>Drawer body</DrawerBody>
              </DrawerContent>
            </Drawer>
          )}
        </>
      );
    };

    render(<Flow />);
    await flushLayers();
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await flushLayers();

    expect(onDrawerOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.getByText('Drawer body')).toBeInTheDocument();
  });

  // Ark's Dialog.Root renders no DOM, so a follow-up Drawer can sit next to DialogContent inside the
  // closing Dialog's root. Only overlays rendered inside the content are its descendants.
  it('keeps a Drawer rendered beside the closing DialogContent open', async () => {
    const user = userEvent.setup();
    const onDrawerOpenChange = rs.fn();

    const Flow = () => {
      const [step, setStep] = useState<'create' | 'continue'>('create');
      return (
        <Dialog open={step === 'create'}>
          <DialogContent>
            <DialogBody>
              <Button onClick={() => setStep('continue')}>Continue</Button>
            </DialogBody>
          </DialogContent>
          {step === 'continue' && (
            <Drawer open onOpenChange={onDrawerOpenChange}>
              <DrawerContent>
                <DrawerBody>Drawer body</DrawerBody>
              </DrawerContent>
            </Drawer>
          )}
        </Dialog>
      );
    };

    render(<Flow />);
    await flushLayers();
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await flushLayers();

    expect(onDrawerOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.getByText('Drawer body')).toBeInTheDocument();
  });

  // jsdom has no exit animation, so a nested Drawer unmounts before its parent's layer leaves the
  // stack and the cascade never reaches it — exercise the ancestry check directly.
  it('lets only a React-ancestor layer dismiss a Drawer', () => {
    const request = (targetLayer?: HTMLElement) =>
      new CustomEvent('layer:request-dismiss', {
        cancelable: true,
        detail: { originalLayer: document.body, targetLayer, originalIndex: 1, targetIndex: 0 },
      });
    const layer = (id: string) => Object.assign(document.createElement('div'), { id });
    const handler = keepOpenUnlessAncestorCloses(['grandparent', 'parent']);

    const fromParent = request(layer('parent'));
    handler(fromParent);
    expect(fromParent.defaultPrevented).toBe(false);

    const fromGrandparent = request(layer('grandparent'));
    handler(fromGrandparent);
    expect(fromGrandparent.defaultPrevented).toBe(false);

    const fromSibling = request(layer('sibling-dialog'));
    handler(fromSibling);
    expect(fromSibling.defaultPrevented).toBe(true);

    const withoutTarget = request();
    handler(withoutTarget);
    expect(withoutTarget.defaultPrevented).toBe(true);
  });

  // The closing dialog's focus trap returns focus to the page button that opened it.
  // A modal drawer can't lose focus by user action, so that move must not dismiss it.
  it('keeps a modal Drawer open when focus is moved outside programmatically', async () => {
    const onOpenChange = rs.fn();

    render(
      <>
        <button type='button'>Add</button>
        <Drawer open onOpenChange={onOpenChange}>
          <DrawerContent>
            <DrawerBody>Body</DrawerBody>
          </DrawerContent>
        </Drawer>
      </>,
    );

    await screen.findByText('Body');
    await flushLayers();
    act(() => screen.getByRole('button', { name: 'Add', hidden: true }).focus());
    await flushLayers();

    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('still closes a non-modal Drawer when focus moves outside', async () => {
    const onOpenChange = rs.fn();

    render(
      <>
        <button type='button'>Elsewhere</button>
        <Drawer open modal={false} onOpenChange={onOpenChange}>
          <DrawerContent>
            <DrawerBody>Body</DrawerBody>
          </DrawerContent>
        </Drawer>
      </>,
    );

    await screen.findByText('Body');
    await flushLayers();
    act(() => screen.getByRole('button', { name: 'Elsewhere' }).focus());
    await flushLayers();

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // A nested dialog's exit animation keeps its content mounted for a moment; focus that lands on
  // one of its buttons is not the user leaving the non-modal parent.
  it('keeps a non-modal Drawer open when focus lands inside an exiting dialog layer', async () => {
    const onOpenChange = rs.fn();

    render(
      <>
        <div data-scope='dialog' data-part='content' data-state='closed'>
          <button type='button'>Leave without saving</button>
        </div>
        <Drawer open modal={false} onOpenChange={onOpenChange}>
          <DrawerContent>
            <DrawerBody>Body</DrawerBody>
          </DrawerContent>
        </Drawer>
      </>,
    );

    await screen.findByText('Body');
    await flushLayers();
    act(() => screen.getByRole('button', { name: 'Leave without saving' }).focus());
    await flushLayers();

    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
