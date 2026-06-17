import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../Button';
import { Drawer } from './Drawer';
import { DrawerBody } from './DrawerBody';
import { DrawerClose } from './DrawerClose';
import { DrawerContent } from './DrawerContent';
import { DrawerFooter } from './DrawerFooter';
import { DrawerHeader } from './DrawerHeader';
import { DrawerResizeHandle } from './DrawerResizeHandle';
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
    const onClick = vi.fn();

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
    const onMouseDown = vi.fn();

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
    const onClick = vi.fn();

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
    const onEscapeKeyDown = vi.fn();

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
    const onInteractOutside = vi.fn();

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
    const onResizeStart = vi.fn();
    const onResizeEnd = vi.fn<(width: number) => void>();

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
