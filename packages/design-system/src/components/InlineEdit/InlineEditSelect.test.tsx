import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InlineEdit } from './InlineEdit';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditSelect } from './InlineEditSelect';

const items = [
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' },
];

function Harness({
  onCommit,
  value = ['editor'],
  multiple = false,
  analyticsId,
}: {
  onCommit?: (v: unknown) => void;
  value?: string[] | string;
  multiple?: boolean;
  analyticsId?: string;
}) {
  return (
    <InlineEdit defaultValue={value} defaultEdit onValueCommit={onCommit} data-testid='ie'>
      <InlineEditControl>
        {multiple ? (
          <InlineEditSelect items={items} multiple data-analytics-id={analyticsId} />
        ) : (
          <InlineEditSelect items={items} data-analytics-id={analyticsId} />
        )}
      </InlineEditControl>
    </InlineEdit>
  );
}

// Ark's `Select` root always renders an aria-hidden native `<select>` mirror
// (`ArkUiSelect.HiddenSelect`) with `<option>` elements duplicating every item
// label, driven directly by the `collection` — independent of the visible
// composition (default or custom children). This makes plain `getByText`
// ambiguous (jsdom quirk `Select.test.tsx` never hits, since it queries
// options via `data-testid` instead of text). `ignore: 'option'` excludes
// that hidden mirror from the match pool without weakening any assertion.
const ignoreHiddenSelectOption = { ignore: 'option' };

describe('InlineEditSelect', () => {
  it('opens on mount and shows options from items', async () => {
    render(<Harness />);
    expect(await screen.findByText('Admin', ignoreHiddenSelectOption)).toBeInTheDocument();
  });

  it('picking an option (single) commits on close', async () => {
    const onCommit = vi.fn();
    render(<Harness onCommit={onCommit} />);
    const option = await screen.findByText('Admin', ignoreHiddenSelectOption);
    // Opening on mount alone must not commit — only the close does.
    expect(onCommit).not.toHaveBeenCalled();
    await userEvent.click(option);
    // Single select closes on selection → onOpenChange(open:false) → submit()
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith(['admin']);
  });

  it('normalizes a plain string committed value into an array draft', async () => {
    render(<Harness value='editor' />);
    // Draft is normalized to ['editor'] — Editor option is marked selected.
    // Scoped to the listbox: the trigger button also renders the selected
    // value's text ("Editor"), which would otherwise collide with the option.
    const listbox = await screen.findByRole('listbox');
    const option = within(listbox).getByText('Editor', ignoreHiddenSelectOption);
    expect(option.closest('[data-state]')).toHaveAttribute('data-state', 'checked');
  });

  it('forwards data-analytics-id to the real trigger', async () => {
    render(<Harness analyticsId='role-edit' />);
    expect(document.querySelector('[data-analytics-id="role-edit"]')?.tagName).toBe('BUTTON');
  });

  it('children replace the default composition (per-option analytics path)', async () => {
    render(
      <InlineEdit defaultValue={['admin']} defaultEdit data-testid='ie'>
        <InlineEditControl>
          <InlineEditSelect items={items}>
            <span data-testid='custom-composition' />
          </InlineEditSelect>
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.getByTestId('custom-composition')).toBeInTheDocument();
    expect(screen.queryByText('Admin', ignoreHiddenSelectOption)).not.toBeInTheDocument();
  });

  it('derives the shared input testId slot', () => {
    render(<Harness />);
    expect(screen.getByTestId('ie--input')).toBeInTheDocument();
  });

  describe('multiple', () => {
    it('renders the SelectInput div trigger instead of SelectButton', async () => {
      render(<Harness multiple />);
      const trigger = await screen.findByTestId('ie--input');
      expect(trigger.tagName).not.toBe('BUTTON');
      expect(trigger.tagName).toBe('DIV');
      // SelectInput-distinctive: Ark trigger part rendered as a div.
      expect(trigger).toHaveAttribute('data-part', 'trigger');
    });

    it('stays open across picks and commits the multi-value array on close', async () => {
      const onCommit = vi.fn();
      render(<Harness onCommit={onCommit} value={[]} multiple />);
      const listbox = await screen.findByRole('listbox');

      await userEvent.click(within(listbox).getByText('Admin', ignoreHiddenSelectOption));
      // Multi-select does NOT close on selection — no commit yet.
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(onCommit).not.toHaveBeenCalled();

      await userEvent.click(within(listbox).getByText('Editor', ignoreHiddenSelectOption));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(onCommit).not.toHaveBeenCalled();

      // Toggle-close via the trigger (outside-click dismissal relies on
      // document-level pointer tracking jsdom doesn't drive reliably)
      // → onOpenChange(open:false) → submit()
      await userEvent.click(screen.getByTestId('ie--input'));
      expect(onCommit).toHaveBeenCalledTimes(1);
      expect(onCommit).toHaveBeenCalledWith(['admin', 'editor']);
    });

    it('forwards data-analytics-id to the real div trigger', async () => {
      render(<Harness multiple analyticsId='roles-edit' />);
      const target = document.querySelector('[data-analytics-id="roles-edit"]');
      expect(target?.tagName).toBe('DIV');
      expect(target).toBe(screen.getByTestId('ie--input'));
    });
  });
});
