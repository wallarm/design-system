import { useState } from 'react';
import { describe, expect, it, rs } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestIdProvider } from '../../utils/testId';
import { Dialog, DialogContent } from '../Dialog';
import { Drawer, DrawerContent } from '../Drawer';
import { Composer } from './ChatInput.test.helpers';

const textarea = () => screen.getByTestId('ci--textarea') as HTMLTextAreaElement;
const submit = () => screen.getByTestId('ci--submit') as HTMLButtonElement;

describe('ChatInput — typing and submit', () => {
  it('calls onValueChange while typing', async () => {
    const onValueChange = rs.fn();
    render(<Composer data-testid='ci' onValueChange={onValueChange} />);
    await userEvent.type(textarea(), 'Hi');
    expect(onValueChange).toHaveBeenLastCalledWith('Hi');
  });

  it('submits the trimmed value on Enter and keeps focus in the textarea', async () => {
    const onSubmit = rs.fn();
    render(<Composer data-testid='ci' onSubmit={onSubmit} />);
    await userEvent.type(textarea(), '  hello  {Enter}');
    expect(onSubmit).toHaveBeenCalledWith('hello');
    expect(textarea()).toHaveValue('');
    expect(textarea()).toHaveFocus();
  });

  it('submits on Send click', async () => {
    const onSubmit = rs.fn();
    render(<Composer data-testid='ci' initialValue='hi' onSubmit={onSubmit} />);
    await userEvent.click(submit());
    expect(onSubmit).toHaveBeenCalledWith('hi');
    expect(textarea()).toHaveFocus();
  });

  it('inserts a newline on Shift+Enter instead of submitting', async () => {
    const onSubmit = rs.fn();
    render(<Composer data-testid='ci' onSubmit={onSubmit} />);
    await userEvent.type(textarea(), 'a{Shift>}{Enter}{/Shift}b');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(textarea()).toHaveValue('a\nb');
  });

  it('ignores Enter during IME composition (isComposing and keyCode 229)', () => {
    const onSubmit = rs.fn();
    render(<Composer data-testid='ci' initialValue='にほん' onSubmit={onSubmit} />);
    fireEvent.keyDown(textarea(), { key: 'Enter', isComposing: true });
    fireEvent.keyDown(textarea(), { key: 'Enter', keyCode: 229 });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables Send for an empty or whitespace value and makes Enter a no-op', async () => {
    const onSubmit = rs.fn();
    render(<Composer data-testid='ci' initialValue='   ' onSubmit={onSubmit} />);
    expect(submit()).toBeDisabled();
    expect(submit()).toHaveAttribute('type', 'submit');
    expect(submit()).toHaveAccessibleName('Send');
    await userEvent.type(textarea(), '{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('ChatInput — running', () => {
  it('turns the button into Stop, which calls onStop', async () => {
    const onStop = rs.fn();
    render(<Composer data-testid='ci' isRunning onStop={onStop} />);
    expect(submit()).toHaveAccessibleName('Stop response');
    expect(submit()).toHaveAttribute('type', 'button');
    expect(submit()).toBeEnabled();
    await userEvent.click(submit());
    expect(onStop).toHaveBeenCalledOnce();
  });

  it('clicking Stop with an empty draft moves focus to the textarea', async () => {
    const Host = () => {
      const [running, setRunning] = useState(true);
      return <Composer data-testid='ci' isRunning={running} onStop={() => setRunning(false)} />;
    };
    render(<Host />);
    await userEvent.click(submit());
    expect(submit()).toBeDisabled();
    expect(textarea()).toHaveFocus();
  });

  it('shares a consumer id with the Stop tooltip trigger', async () => {
    render(<Composer data-testid='ci' isRunning submitProps={{ id: 'my-submit' }} />);
    expect(submit()).toHaveAttribute('id', 'my-submit');
    await userEvent.hover(submit());
    const tip = await screen.findByTestId('ci--submit--content');
    expect(submit()).toHaveAttribute('aria-describedby', tip.id);
  });

  it('clicking Stop with a draft does not submit it once isRunning flips off', async () => {
    const onSubmit = rs.fn();
    const Host = () => {
      const [running, setRunning] = useState(true);
      return (
        <Composer
          data-testid='ci'
          initialValue='follow-up'
          isRunning={running}
          onStop={() => setRunning(false)}
          onSubmit={onSubmit}
        />
      );
    };
    render(<Host />);
    // jsdom resolves the activation before React re-renders, so also assert the click's
    // default is cancelled — that is what blocks the submit in real browsers.
    expect(fireEvent.click(submit())).toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(textarea().value).toBe('follow-up');
    expect(submit()).toHaveAccessibleName('Send');
  });

  it('does not submit on Enter and stops on Esc', async () => {
    const onSubmit = rs.fn();
    const onStop = rs.fn();
    render(
      <Composer
        data-testid='ci'
        initialValue='next'
        isRunning
        onSubmit={onSubmit}
        onStop={onStop}
      />,
    );
    await userEvent.type(textarea(), '{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.type(textarea(), '{Escape}');
    expect(onStop).toHaveBeenCalledOnce();
  });

  it('ignores Esc while idle', async () => {
    const onStop = rs.fn();
    render(<Composer data-testid='ci' onStop={onStop} />);
    await userEvent.type(textarea(), '{Escape}');
    expect(onStop).not.toHaveBeenCalled();
  });

  it('keeps the same button node across the send ↔ stop swap', () => {
    const { rerender } = render(<Composer data-testid='ci' initialValue='hi' />);
    const before = submit();
    rerender(<Composer data-testid='ci' initialValue='hi' isRunning />);
    expect(submit()).toBe(before);
  });
});

describe('ChatInput — Esc inside a dismissable layer', () => {
  it('stops the run without closing a Dialog, then lets Esc close it when idle', async () => {
    const onOpenChange = rs.fn();
    const Host = () => {
      const [running, setRunning] = useState(true);
      return (
        <Dialog open onOpenChange={onOpenChange}>
          <DialogContent>
            <Composer data-testid='ci' isRunning={running} onStop={() => setRunning(false)} />
          </DialogContent>
        </Dialog>
      );
    };
    render(<Host />);
    textarea().focus();
    await userEvent.keyboard('{Escape}');
    expect(submit()).toHaveAccessibleName('Send');
    expect(onOpenChange).not.toHaveBeenCalled();

    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('stops the run without closing a Drawer', async () => {
    const onStop = rs.fn();
    const onOpenChange = rs.fn();
    render(
      <Drawer open onOpenChange={onOpenChange}>
        <DrawerContent>
          <Composer data-testid='ci' isRunning onStop={onStop} />
        </DrawerContent>
      </Drawer>,
    );
    textarea().focus();
    await userEvent.keyboard('{Escape}');
    expect(onStop).toHaveBeenCalledOnce();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('leaves Esc to the Dialog while running without onStop', async () => {
    const onOpenChange = rs.fn();
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent>
          <Composer data-testid='ci' isRunning />
        </DialogContent>
      </Dialog>,
    );
    textarea().focus();
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('leaves Esc to the layer while the textarea is aria-expanded', async () => {
    const onStop = rs.fn();
    const onOpenChange = rs.fn();
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent>
          <Composer
            data-testid='ci'
            isRunning
            onStop={onStop}
            textareaProps={{ 'aria-expanded': true }}
          />
        </DialogContent>
      </Dialog>,
    );
    textarea().focus();
    await userEvent.keyboard('{Escape}');
    expect(onStop).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('ChatInput — handler composition', () => {
  it('runs consumer onKeyDown first; its preventDefault suppresses Enter-submit', async () => {
    const onSubmit = rs.fn();
    const order: string[] = [];
    render(
      <Composer
        data-testid='ci'
        initialValue='hi'
        onSubmit={onSubmit}
        textareaProps={{
          onKeyDown: e => {
            order.push('consumer');
            e.preventDefault();
          },
        }}
      />,
    );
    await userEvent.type(textarea(), '{Enter}');
    expect(order).toEqual(['consumer']);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('fires consumer onChange alongside onValueChange', async () => {
    const onChange = rs.fn();
    const onValueChange = rs.fn();
    render(
      <Composer data-testid='ci' onValueChange={onValueChange} textareaProps={{ onChange }} />,
    );
    await userEvent.type(textarea(), 'x');
    expect(onChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith('x');
  });

  it('consumer preventDefault on the Stop click cancels onStop', async () => {
    const onStop = rs.fn();
    render(
      <Composer
        data-testid='ci'
        isRunning
        onStop={onStop}
        submitProps={{ onClick: e => e.preventDefault() }}
      />,
    );
    await userEvent.click(submit());
    expect(onStop).not.toHaveBeenCalled();
  });
});

describe('ChatInput — disclaimer, context, disabled', () => {
  it('renders the default disclaimer and points the textarea at it', () => {
    render(<Composer data-testid='ci' />);
    const disclaimer = screen.getByTestId('ci--disclaimer');
    expect(disclaimer).toHaveTextContent('Wally can make mistakes; always verify.');
    expect(textarea()).toHaveAccessibleDescription('Wally can make mistakes; always verify.');
  });

  it('merges a consumer aria-describedby with the disclaimer id', () => {
    render(
      <>
        <span id='hint'>Hint</span>
        <Composer data-testid='ci' textareaProps={{ 'aria-describedby': 'hint' }} />
      </>,
    );
    const ids = textarea().getAttribute('aria-describedby')?.split(' ');
    expect(ids).toEqual(['hint', screen.getByTestId('ci--disclaimer').id]);
  });

  it.each([null, false])('hides the disclaimer for %s and drops aria-describedby', value => {
    render(<Composer data-testid='ci' disclaimer={value} />);
    expect(screen.queryByTestId('ci--disclaimer')).toBeNull();
    expect(textarea()).not.toHaveAttribute('aria-describedby');
  });

  it('hides the context bar once the last chip is removed (empty array)', () => {
    const { rerender } = render(
      <Composer
        data-testid='ci'
        context={['Attacks'].map(label => (
          <span key={label}>{label}</span>
        ))}
      />,
    );
    expect(screen.getByTestId('ci--context')).toBeTruthy();
    rerender(<Composer data-testid='ci' context={[]} />);
    expect(screen.queryByTestId('ci--context')).toBeNull();
  });

  it('hides the context bar for context={false}', () => {
    render(<Composer data-testid='ci' context={false} />);
    expect(screen.queryByTestId('ci--context')).toBeNull();
  });

  it('renders the context bar around the box only when context is set', () => {
    const { rerender } = render(<Composer data-testid='ci' />);
    expect(screen.queryByTestId('ci--context')).toBeNull();
    rerender(<Composer data-testid='ci' context={<span>Attacks</span>} />);
    const bar = screen.getByTestId('ci--context');
    expect(bar).toHaveTextContent('Attacks');
    expect(bar.lastElementChild).toBe(screen.getByTestId('ci--box'));
  });

  it('disables the textarea and the button, and blocks submit', () => {
    const onSubmit = rs.fn();
    render(<Composer data-testid='ci' initialValue='hi' disabled onSubmit={onSubmit} />);
    expect(textarea()).toBeDisabled();
    expect(submit()).toBeDisabled();
    fireEvent.submit(screen.getByTestId('ci'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('applies default placeholder and aria-label, both overridable', () => {
    const { rerender } = render(<Composer data-testid='ci' />);
    expect(textarea()).toHaveAttribute('placeholder', 'Ask Wally...');
    expect(textarea()).toHaveAccessibleName('Message Wally');
    rerender(
      <Composer data-testid='ci' textareaProps={{ placeholder: 'Ask', 'aria-label': 'Prompt' }} />,
    );
    expect(textarea()).toHaveAttribute('placeholder', 'Ask');
    expect(textarea()).toHaveAccessibleName('Prompt');
  });
});

describe('ChatInput — data-testid cascade', () => {
  it('uses the consumer id as the base when standalone', () => {
    render(<Composer data-testid='composer' context='ctx' />);
    for (const id of [
      'composer',
      'composer--context',
      'composer--box',
      'composer--textarea',
      'composer--submit',
      'composer--disclaimer',
    ]) {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    }
    expect(screen.getByTestId('composer').tagName).toBe('FORM');
    expect(screen.getByTestId('composer')).toHaveAttribute('data-slot', 'chat-input');
  });

  it('derives `input` from a parent cascade', () => {
    render(
      <TestIdProvider value='chat'>
        <Composer />
      </TestIdProvider>,
    );
    expect(screen.getByTestId('chat--input')).toBeInTheDocument();
    expect(screen.getByTestId('chat--input--textarea')).toBeInTheDocument();
    expect(screen.getByTestId('chat--input--submit')).toBeInTheDocument();
  });

  it('lets a leaf override its own id', () => {
    render(<Composer data-testid='ci' textareaProps={{ 'data-testid': 'prompt' }} />);
    expect(screen.getByTestId('prompt').tagName).toBe('TEXTAREA');
  });

  it('renders no data-testid without a base', () => {
    const { container } = render(<Composer />);
    expect(container.querySelector('[data-testid]')).toBeNull();
  });
});
