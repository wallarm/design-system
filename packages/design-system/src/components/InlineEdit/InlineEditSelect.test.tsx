import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useTestId } from '../../utils/testId';
import {
  createListCollection,
  SelectButton,
  SelectContent,
  SelectInput,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
} from '../Select';
import { InlineEdit } from './InlineEdit';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditSelect } from './InlineEditSelect';

const items = [
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' },
];

// SelectInput does not self-cascade its testid (unlike SelectButton/
// SelectOption) — a consumer wanting a stable one derives it themselves via
// useTestId, which only resolves correctly from a component rendered as a
// descendant of <InlineEdit> (i.e. not from the top of a test's Harness).
function SelectInputTrigger({ analyticsId }: { analyticsId?: string }) {
  const testId = useTestId('input');
  return <SelectInput data-testid={testId} data-analytics-id={analyticsId} />;
}

function SelectParts({
  multiple = false,
  analyticsId,
}: {
  multiple?: boolean;
  analyticsId?: string;
}) {
  return (
    <>
      {multiple ? (
        <SelectInputTrigger analyticsId={analyticsId} />
      ) : (
        <SelectButton data-analytics-id={analyticsId} />
      )}
      <SelectPositioner>
        <SelectContent>
          {items.map(item => (
            <SelectOption key={item.value} item={item}>
              <SelectOptionText>{item.label}</SelectOptionText>
              <SelectOptionIndicator />
            </SelectOption>
          ))}
        </SelectContent>
      </SelectPositioner>
    </>
  );
}

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
        <InlineEditSelect items={items} multiple={multiple}>
          <SelectParts multiple={multiple} analyticsId={analyticsId} />
        </InlineEditSelect>
      </InlineEditControl>
    </InlineEdit>
  );
}

// Ark's `Select` root always renders an aria-hidden native `<select>` mirror
// (`ArkUiSelect.HiddenSelect`) with `<option>` elements duplicating every item
// label, driven directly by the `collection` — independent of the visible
// composition. This makes plain `getByText` ambiguous (jsdom quirk
// `Select.test.tsx` never hits, since it queries options via `data-testid`
// instead of text). `ignore: 'option'` excludes that hidden mirror from the
// match pool without weakening any assertion.
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
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith(['admin']);
  });

  it('seeds the highlighted item to the current selection so Arrow keys have somewhere to move from', async () => {
    // Regression: `defaultOpen` initializes Ark's Select machine directly in
    // the `open` state rather than transitioning into it, so
    // `highlightFirstSelectedItem` (a transition action) never runs and no
    // item is highlighted at all — Arrow keys had no valid starting index
    // to move from (verified live: comparing against a standalone Select
    // opened via click, which highlights the selected item immediately).
    render(<Harness />);
    const listbox = await screen.findByRole('listbox');
    const editor = within(listbox).getByText('Editor', ignoreHiddenSelectOption);
    expect(editor.closest('[data-highlighted]')).toBeInTheDocument();
  });

  it('normalizes a plain string committed value into an array draft', async () => {
    render(<Harness value='editor' />);
    const listbox = await screen.findByRole('listbox');
    const option = within(listbox).getByText('Editor', ignoreHiddenSelectOption);
    expect(option.closest('[data-state]')).toHaveAttribute('data-state', 'checked');
  });

  it('forwards data-analytics-id to the real trigger', async () => {
    render(<Harness analyticsId='role-edit' />);
    expect(document.querySelector('[data-analytics-id="role-edit"]')?.tagName).toBe('BUTTON');
  });

  it('renders only the given children — no fallback composition exists to leak through', async () => {
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

  it('collection-only usage renders options from the resolved collection and commits on close', async () => {
    const onCommit = vi.fn();
    const collection = createListCollection({ items });
    render(
      <InlineEdit defaultValue={['editor']} defaultEdit onValueCommit={onCommit} data-testid='ie'>
        <InlineEditControl>
          <InlineEditSelect collection={collection}>
            <SelectParts />
          </InlineEditSelect>
        </InlineEditControl>
      </InlineEdit>,
    );
    const option = await screen.findByText('Admin', ignoreHiddenSelectOption);
    await userEvent.click(option);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith(['admin']);
  });

  it('warns in dev when both items and collection are provided', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const collection = createListCollection({ items });
    render(
      <InlineEdit defaultValue={['editor']} defaultEdit data-testid='ie'>
        <InlineEditControl>
          <InlineEditSelect items={items} collection={collection}>
            <SelectParts />
          </InlineEditSelect>
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('InlineEditSelect'));
    warnSpy.mockRestore();
  });

  it('warns in dev when neither items nor collection are provided', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <InlineEdit defaultValue={[]} defaultEdit data-testid='ie'>
        <InlineEditControl>
          <InlineEditSelect>
            <SelectParts />
          </InlineEditSelect>
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('InlineEditSelect'));
    warnSpy.mockRestore();
  });

  it('bridges the ambient InlineEdit testid into a bare SelectButton/SelectOption with zero extra wiring', async () => {
    render(<Harness />);
    // SelectButton calls useTestId('button', ...) itself and cascades directly
    // off the root — InlineEditSelect only forwards a transparent useTestId()
    // onto <Select>.
    expect(screen.getByTestId('ie--button')).toBeInTheDocument();
    // SelectOption cascades too, but with two twists verified against the real
    // DOM (not asserted from the doc comment alone): (a) one level further —
    // SelectContent's ScrollArea wrapper re-provides the cascade scoped to its
    // own 'content' slot, so options resolve under `{base}--content--option`
    // rather than `{base}--option`; and (b) with no per-item disambiguation —
    // every SelectOption in the collection resolves to the identical derived
    // testid (no index/value segment), so a 2-item collection always yields 2
    // matches sharing one testid. Both are pre-existing `Select`-family cascade
    // characteristics, orthogonal to this bridge — assert on the first match,
    // in items order.
    const options = await screen.findAllByTestId('ie--content--option');
    expect(options[0]).toHaveTextContent('Admin');
  });

  describe('multiple', () => {
    it('renders the SelectInput div trigger, testid supplied explicitly by the consumer', async () => {
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
