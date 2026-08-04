import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Button } from '../Button';
import { Dialog } from './Dialog';
import { DialogBody } from './DialogBody';
import { DialogClose } from './DialogClose';
import { DialogContent } from './DialogContent';
import { DialogDescription } from './DialogDescription';
import { DialogFooter } from './DialogFooter';
import { DialogHeader } from './DialogHeader';
import { DialogTitle } from './DialogTitle';
import { DialogTrigger } from './DialogTrigger';

describe('Attribute pass-through', () => {
  it('forwards data-analytics-id to the default DialogTrigger <button>', () => {
    render(
      <Dialog>
        <DialogTrigger data-testid='trigger' data-analytics-id='OPEN_DIALOG'>
          Open
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
          <DialogBody>Body</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('data-analytics-id', 'OPEN_DIALOG');
  });

  it('forwards data-analytics-props verbatim on the DialogTrigger', () => {
    const payload = JSON.stringify({ feature: 'host', action: 'open' });

    render(
      <Dialog>
        <DialogTrigger
          data-testid='trigger'
          data-analytics-id='OPEN_DIALOG'
          data-analytics-props={payload}
        >
          Open
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
          <DialogBody>Body</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByTestId('trigger')).toHaveAttribute('data-analytics-props', payload);
  });

  it('preserves analytics on a Button wrapped by DialogTrigger asChild', () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button data-testid='trigger' data-analytics-id='OPEN_VIA_CHILD'>
            Open
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
          <DialogBody>Body</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('data-analytics-id', 'OPEN_VIA_CHILD');
  });

  it('forwards data-analytics-id to the default DialogClose icon <button>', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogClose data-testid='close' data-analytics-id='CLOSE_DIALOG' />
          </DialogHeader>
          <DialogBody>Body</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    const close = screen.getByTestId('close');
    expect(close.tagName).toBe('BUTTON');
    expect(close).toHaveAttribute('data-analytics-id', 'CLOSE_DIALOG');
  });

  it('forwards data-analytics-props verbatim on the default DialogClose', () => {
    const payload = JSON.stringify({ feature: 'host', action: 'close' });

    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogClose
              data-testid='close'
              data-analytics-id='CLOSE_DIALOG'
              data-analytics-props={payload}
            />
          </DialogHeader>
          <DialogBody>Body</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByTestId('close')).toHaveAttribute('data-analytics-props', payload);
  });

  it('preserves analytics on the cancel button via DialogClose asChild', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
          <DialogBody>Body</DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button data-testid='cancel' data-analytics-id='CANCEL_DIALOG'>
                Cancel
              </Button>
            </DialogClose>
            <Button data-testid='confirm' data-analytics-id='CONFIRM_DIALOG'>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    const cancel = screen.getByTestId('cancel');
    expect(cancel.tagName).toBe('BUTTON');
    expect(cancel).toHaveAttribute('data-analytics-id', 'CANCEL_DIALOG');

    const confirm = screen.getByTestId('confirm');
    expect(confirm.tagName).toBe('BUTTON');
    expect(confirm).toHaveAttribute('data-analytics-id', 'CONFIRM_DIALOG');
  });

  it('does not strand DialogTrigger analytics on a footer cancel/confirm button', () => {
    render(
      <Dialog open>
        <DialogTrigger data-testid='trigger' data-analytics-id='OPEN_DIALOG'>
          Open
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
          <DialogBody>Body</DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button data-testid='cancel' data-analytics-id='CANCEL_DIALOG'>
                Cancel
              </Button>
            </DialogClose>
            <Button data-testid='confirm' data-analytics-id='CONFIRM_DIALOG'>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByTestId('trigger')).toHaveAttribute('data-analytics-id', 'OPEN_DIALOG');
    expect(screen.getByTestId('cancel')).toHaveAttribute('data-analytics-id', 'CANCEL_DIALOG');
    expect(screen.getByTestId('confirm')).toHaveAttribute('data-analytics-id', 'CONFIRM_DIALOG');
    expect(screen.getByTestId('cancel')).not.toHaveAttribute('data-analytics-id', 'OPEN_DIALOG');
    expect(screen.getByTestId('confirm')).not.toHaveAttribute('data-analytics-id', 'OPEN_DIALOG');
  });

  it('explicit DialogClose inside DialogHeader suppresses the auto-rendered close', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogClose data-testid='close' data-analytics-id='CLOSE_DIALOG' />
          </DialogHeader>
          <DialogBody>Body</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    const closes = screen.getAllByLabelText('Close drawer');
    expect(closes).toHaveLength(1);
    expect(closes[0]).toBe(screen.getByTestId('close'));
    expect(closes[0]).toHaveAttribute('data-analytics-id', 'CLOSE_DIALOG');
  });

  it('DialogHeader auto-renders a default close when no DialogClose child is provided', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
          <DialogBody>Body</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    const close = screen.getByLabelText('Close drawer');
    expect(close.tagName).toBe('BUTTON');
    expect(close).not.toHaveAttribute('data-analytics-id');
  });

  it('default DialogClose keeps DS-owned ghost/neutral styling', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogClose data-testid='close' />
          </DialogHeader>
          <DialogBody>Body</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    const close = screen.getByTestId('close');
    expect(close.tagName).toBe('BUTTON');
    expect(close.className).toContain('bg-transparent');
    expect(close).not.toHaveAttribute('color');
  });

  it('preserves analytics across open and close transitions', async () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button data-testid='trigger' data-analytics-id='OPEN_DIALOG'>
            Open
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogClose data-testid='close' data-analytics-id='CLOSE_DIALOG' />
          </DialogHeader>
          <DialogBody>Body</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger).toHaveAttribute('data-analytics-id', 'OPEN_DIALOG');

    await userEvent.click(trigger);

    const close = await screen.findByTestId('close');
    expect(close).toHaveAttribute('data-analytics-id', 'CLOSE_DIALOG');

    await userEvent.click(close);

    expect(screen.getByTestId('trigger')).toHaveAttribute('data-analytics-id', 'OPEN_DIALOG');
  });
});

describe('DialogHeader grouping of DialogTitle / DialogDescription', () => {
  it('stacks DialogTitle and DialogDescription in a column, with DialogDescription cascading data-testid', () => {
    render(
      <Dialog data-testid='dialog' open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Supporting text</DialogDescription>
          </DialogHeader>
          <DialogBody>Body</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    const description = screen.getByTestId('dialog--description');
    expect(description).toHaveAttribute('data-slot', 'drawer-description');
    expect(description).toHaveTextContent('Supporting text');

    const title = screen.getByText('Title');
    expect(title.parentElement).toBe(description.parentElement);
    expect(title.parentElement?.className).toContain('flex-col');
  });

  it('keeps a trailing non-title/description child (e.g. a nested trigger) as a row sibling, not swallowed into the column', () => {
    render(
      <Dialog data-testid='dialog' open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Supporting text</DialogDescription>
            <button type='button' data-testid='extra'>
              Extra action
            </button>
          </DialogHeader>
          <DialogBody>Body</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    const description = screen.getByTestId('dialog--description');
    const extra = screen.getByTestId('extra');
    expect(extra.parentElement).not.toBe(description.parentElement);
  });

  it('wires aria-describedby from the dialog content to DialogDescription', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Supporting text</DialogDescription>
          </DialogHeader>
          <DialogBody>Body</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog');
    const describedBy = dialog.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const descriptionEl = describedBy ? document.getElementById(describedBy) : null;
    expect(descriptionEl).toHaveTextContent('Supporting text');
  });

  it('does not expose a description element when no DialogDescription is present', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
          <DialogBody>Body</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    // Ark's dialog machine always reserves a description id on aria-describedby,
    // whether or not a Dialog.Description is mounted — assert no element answers it.
    const describedBy = screen.getByRole('dialog').getAttribute('aria-describedby');
    const descriptionEl = describedBy ? document.getElementById(describedBy) : null;
    expect(descriptionEl).toBeNull();
  });
});
