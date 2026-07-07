// InlineEditControl.test.tsx

import { StrictMode, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InlineEdit } from './InlineEdit';
import {
  type InlineEditSubmitMode,
  useInlineEdit,
  useInlineEditSubmitMode,
} from './InlineEditContext';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditInput } from './InlineEditInput';
import { InlineEditPreview } from './InlineEditPreview';

function ControlledInput() {
  return <input data-testid='editor' defaultValue='hello' />;
}

describe('InlineEditControl', () => {
  it('renders nothing when not editing', () => {
    render(
      <InlineEdit defaultValue='hello' data-testid='attr'>
        <InlineEditControl>
          <ControlledInput />
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.queryByTestId('attr--control')).toBeNull();
  });

  it('focuses the editor on entering edit mode', () => {
    render(
      <InlineEdit defaultEdit data-testid='attr'>
        <InlineEditControl>
          <ControlledInput />
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.getByTestId('editor')).toHaveFocus();
  });

  it('submits on Enter', async () => {
    const onCommit = vi.fn();
    render(
      <InlineEdit defaultEdit onValueCommit={onCommit} data-testid='attr'>
        <InlineEditControl>
          <ControlledInput />
        </InlineEditControl>
      </InlineEdit>,
    );
    await userEvent.keyboard('{Enter}');
    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it('cancels on Escape', async () => {
    const onRevert = vi.fn();
    render(
      <InlineEdit defaultEdit onValueRevert={onRevert} data-testid='attr'>
        <InlineEditControl>
          <ControlledInput />
        </InlineEditControl>
      </InlineEdit>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onRevert).toHaveBeenCalledTimes(1);
  });

  it('focuses the editor when entering edit via the preview (click flow)', async () => {
    render(
      <InlineEdit defaultValue='hello' data-testid='attr'>
        <InlineEditPreview>hello</InlineEditPreview>
        <InlineEditControl>
          <input data-testid='editor' defaultValue='hello' />
        </InlineEditControl>
      </InlineEdit>,
    );
    await userEvent.click(screen.getByTestId('attr--preview'));
    expect(screen.getByTestId('editor')).toHaveFocus();
  });

  it('does not cancel on blur when submitMode is "none"', async () => {
    const onRevert = vi.fn();
    render(
      <InlineEdit defaultEdit submitMode='none' onValueRevert={onRevert} data-testid='attr'>
        <InlineEditControl>
          <ControlledInput />
        </InlineEditControl>
        <button type='button'>outside</button>
      </InlineEdit>,
    );
    screen.getByTestId('editor').focus();
    await userEvent.click(screen.getByText('outside'));
    expect(onRevert).not.toHaveBeenCalled();
    // still editing — the control stays mounted
    expect(screen.getByTestId('attr--control')).toBeInTheDocument();
  });

  it('carries the descendant-selector rules that align composed controls with InlineEditPreview (jsdom cannot compute CSS specificity — see live verification in the component doc comment)', () => {
    render(
      <InlineEdit defaultEdit defaultValue='v' data-testid='attr'>
        <InlineEditControl>
          <ControlledInput />
        </InlineEditControl>
      </InlineEdit>,
    );
    const control = screen.getByTestId('attr--control');
    expect(control.className).toContain('-ml-7');
    expect(control.className).toContain('[&_[data-slot=input]]:px-6');
    expect(control.className).toContain('[&_textarea]:px-6');
    expect(control.className).toContain('[&_[data-scope=number-input][data-part=input]]:px-6');
    expect(control.className).toContain('[&_[data-scope=select][data-part=trigger]]:px-6');
    expect(control.className).toContain(
      '[&_div[data-scope=select][data-part=trigger]:has([data-slot=overflow-list])]:pl-0',
    );
    expect(control.className).toContain('[&_[data-slot=input-group-addon]]:px-6');
    expect(control.className).toContain('[&_[data-slot=input-group]>div:not([data-slot])]:pl-0');
  });
});

function ModeProbe() {
  const { submitMode } = useInlineEdit();
  return <span data-testid='mode'>{submitMode}</span>;
}

function RegisteringEditor({ mode }: { mode: InlineEditSubmitMode }) {
  useInlineEditSubmitMode(mode);
  return <ModeProbe />;
}

describe('submit-mode override', () => {
  it('editor registration overrides the root prop', () => {
    render(
      <InlineEdit defaultValue='v' defaultEdit submitMode='both'>
        <InlineEditControl>
          <RegisteringEditor mode='none' />
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('none');
  });

  it('registration survives StrictMode double-invoke', () => {
    render(
      <StrictMode>
        <InlineEdit defaultValue='v' defaultEdit submitMode='both'>
          <InlineEditControl>
            <RegisteringEditor mode='none' />
          </InlineEditControl>
        </InlineEdit>
      </StrictMode>,
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('none');
  });

  it('unregisters token-safely on unmount (root prop applies again)', () => {
    function Toggle() {
      const [on, setOn] = useState(true);
      return (
        <InlineEdit defaultValue='v' defaultEdit submitMode='both'>
          <button type='button' data-testid='toggle' onClick={() => setOn(false)} />
          <InlineEditControl>
            {on ? <RegisteringEditor mode='none' /> : <ModeProbe />}
          </InlineEditControl>
        </InlineEdit>
      );
    }
    render(<Toggle />);
    expect(screen.getByTestId('mode')).toHaveTextContent('none');
    fireEvent.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('mode')).toHaveTextContent('both');
  });

  it('Control submitMode prop beats editor registration', async () => {
    const onCommit = vi.fn();
    render(
      <InlineEdit
        defaultValue='v'
        defaultEdit
        submitMode='both'
        onValueCommit={onCommit}
        data-testid='ie'
      >
        <InlineEditControl submitMode='none'>
          <RegisteringEditor mode='blur' />
          <InlineEditInput />
        </InlineEditControl>
      </InlineEdit>,
    );
    // Blur out of the control: with 'none' in force nothing commits or cancels.
    fireEvent.blur(screen.getByTestId('ie--input'), { relatedTarget: document.body });
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('ie--input')).toBeInTheDocument();
  });

  it('render-prop children receive the context and render only while editing', () => {
    render(
      <InlineEdit defaultValue='v' defaultEdit>
        <InlineEditControl>
          {ctx => <span data-testid='rp'>{String(ctx.value)}</span>}
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.getByTestId('rp')).toHaveTextContent('v');
  });

  it('keeps cancel gated on defaultPrevented for Escape (popover guard is load-bearing)', () => {
    const onEditChange = vi.fn();
    render(
      <InlineEdit defaultValue='v' defaultEdit onEditChange={onEditChange}>
        <InlineEditControl
          onKeyDown={e => {
            e.preventDefault(); // simulates zag's dismissable-layer preventDefault
          }}
        >
          <InlineEditInput />
        </InlineEditControl>
      </InlineEdit>,
    );
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
    expect(onEditChange).not.toHaveBeenCalledWith(false);
  });
});
